const fs = require("fs");
const path = require("path");
const archiver = require('archiver');

const core = require('@actions/core');
const github = require('@actions/github');


///
/// Code
///

console.log("== Run ==")

const dir = core.getInput("dir");

console.log("Input: ")
console.log("   Dir: " + dir);
console.log("Programm: ")
const rootDir = path.join(process.env.GITHUB_WORKSPACE, dir);
console.log("   rootDir: " + rootDir);

if(!fs.existsSync(rootDir)){ 
    console.log(rootDir + " - Not Found");
    return;
}

const stats = fs.lstatSync(rootDir);

if(!stats.isDirectory) { 
    console.log(dir + " - Is not a directory");
}

let fileObject = fs.readdirSync(rootDir);

console.log("   Current directory filenames:"); 

fileObject.forEach(file => { 
    const fStats = fs.lstatSync(file);

    if(fStats.isDirectory()) { 
        const zipFilePath = file + ".zip";
        console.log("   zipFilePath: " + zipFilePath);
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
        console.log(" ");
    }
});