const fs = require("fs");
const path = require("path");
const archiver = require('archiver');

const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

///
/// Code
///
(async function() { 
    console.log("== Run ==");

    const dir = core.getInput("dir", { required: true });
    const root = path.join(process.env.GITHUB_WORKSPACE, dir);

    // const tagName = core.getInput('tag_name', { required: true }).replace('refs/heads/', '');
    // const releaseName = tagName;

    const uploadUrl = core.getInput('upload_url', { required: true});
    const releaseId = core.getInput('release_id', { required: true});
    
    console.log("Input: ");
    console.log("    dir: " + dir);
    // console.log("    tag: " + tagName);
    // console.log("    releaseName: " + releaseName);
    // console.log("    htmlUrl: " + htmlUrl);
    // console.log("    releaseId: " + releaseId);
    
    

    console.log("Programm: ");

    // check dir input
    if(!fs.existsSync(root)){ 
        console.error("    " + root + " - Not Found");
        return;
    }

    let fsStats = fs.lstatSync(root);
    if(!fsStats.isDirectory()){
        console.error("    " + root + " - Is not a directory");
        return;
    }


    const normilizePath = (filePath) => path.join(root, filePath);

    console.log("    rootDir: " + root);

    /*TODO check if dir*/

    const fileObjects = fs.readdirSync(root);

    console.log("    Current directory filenames:"); 

    const fullQualityPaths = fileObjects.map(f => { 
        let fPath = normilizePath(f);
        console.log("        File: " + f + " Path: " + fPath);
        return fPath;
    });

    console.log("    Run:");

    const fullQualityDir = fullQualityPaths.filter(f => fs.statSync(f).isDirectory());

    const fullQualityZip = fullQualityDir.map(f => { 
        console.log("        Current directory for zip: "  + f);

        let fZip = f + ".zip";  
        try { 
            fs.accessSync(f, fs.constants.F_OK);
        } catch (err) { 
            console.error("        Could not acces the " + f);
            return null;
        }
        
        try { 
            fs.accessSync(fZip, fs.constants.F_OK | fs.constants.W_OK);
        } catch(err)  { 
            if(err) { 
                if(err.code === 'ENOENT') { 
                    var fd = fs.openSync(fZip, "w");
                    fs.closeSync(fd);
                } else { 
                    console.error("        Could not acces the " + fZip);
                    return null;
                }                
            }
        }

        var output = fs.createWriteStream(fZip);
        console.error("        Create zip for " + f);
        var zipArchive = archiver('zip');
        zipArchive.pipe(output);
        zipArchive.directory(f, false);
        zipArchive.finalize();
        console.error("        Created zip for " + f);
        
        return fZip;
    });

    let bodyContent  = "# Templates";

    for (const f of fullQualityZip) { 
        
        if(f === null) { 
            continue;
        }
        console.log("        Current zip: "  + f);
        const fileName = path.basename(f);
        const headers = { 
            'content-type': "application/zip", 
            'content-length': fs.statSync(f).size 
        };
        
        const uploadAsset = await octokit.repos.uploadReleaseAsset( {
            url: uploadUrl,
            headers,
            name: fileName,
            file: fs.readFileSync(f)
        });

        bodyContent += `\n\t-[${fileName}](${uploadAsset.url})`;
    }

    const { owner, repo } = github.context.repo;

    await octokit.repos.updateRelease( { 
        owner: owner,
        repo: repo,
        release_id: releaseId, 
        body: bodyContent
    });

})();