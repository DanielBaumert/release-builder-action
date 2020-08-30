const fs = require("fs");
const path = require("path");
const archiver = require('archiver');

const core = require('@actions/core');
const github = require('@actions/github');


///
/// Code
///

const dir = core.getInput("dir");

const rootDir = path.join(process.env.GITHUB_WORKSPACE, dir);

if(!fs.exists(rootDir)){ 
    console.log(`${rootDir} (Not Found)`);
    return;
}

const stats = fs.lstatSync(rootDir);

if(!stats.isDirectory) { 
    console.log(`${dir} (Is not a directory)`);
}


fs.readdirSync(rootDir, (err, files) => { 

    if(err) { 
        return console.log('Unable to scan directory: ' + err );
    }

    files.forEach((file) =>  { 

        const fStats = fs.lstatSync(file);

        if(fStats.isDirectory()) { 
            const zipFilePath = file + ".zip";
            // zip
            try { 
                fs.accessSync(file, fs.constants.F_OK);
                fs.accessSync(zipFilePath, fs.constants.F_OK);
            } catch {
                console.log("can not access the zip");
                return;
            }

            var output = fs.createWriteStream(zipFilePath);

            var zipArchive = archiver('zip');
            zipArchive.pipe(output);
            zipArchive.directory(file, false);
            zipArchive.finalize();
        }
    });
});