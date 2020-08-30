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
 

    console.log("Input: ");
    console.log("    dir: " + dir);

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
        console.log("        Current directory: "  + f);

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


    const { owner, repo } = github.context.repo;
    const tagName = core.getInput('tag_name', { required: true }).replace('refs/tags/', '');
    const releaseName = tagName;
    const body = "";


    const createReleaseResponse = await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: releaseName,
        body: /* bodyFileContent || */ body,
        draft: false,
        prerelease: false
    });

    const {
        data: { 
            id: releaseId, 
            html_url: htmlUrl, 
            upload_url: uploadUrl 
        }
    } = createReleaseResponse;

    fullQualityZip.forEach(async f => { 

        if(f == null) { 
            return;
        }

        const headers = { 
            'content-type': "application/zip", 
            'content-length': fs.statSync(f).size 
        };

        const uploadAssetResponse = await octokit.repos.uploadReleaseAsset({
            url: uploadUrl,
            headers,
            name: assetName,
            file: fs.readFileSync(f)
        });

        const {
            data: { browser_download_url: browserDownloadUrl }
        } = uploadAssetResponse;

        core.setOutput('browser_download_url', browserDownloadUrl);
    });
})();