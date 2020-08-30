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
    console.log("   " + rootDir + " - Not Found");
    return;
}
if(!isDir(rootDir)) { 
    console.log("   " + dir + " - Is not a directory");
    return;
}

let fileObjects = fs.readdirSync(rootDir);

console.log("   Current directory filenames:"); 

fullQualityPaths = fileObjects.map(file => { 
    console.log("File: " + file + " Path: " + normilizePath(file))
});

fullQualityPaths.forEach(file => { 

    if(!isDir(file)) { 
        console.log("       "  + file + " - Is not a directory -> skip");
        return;
    }
    // // zip
    // try { 
    //     fs.accessSync(file, fs.constants.F_OK);
    // } catch {
    //     console.log("       " + file + " - Can not access the directory");
    //     return;
    // }

    // const zipFilePath = file + ".zip";
    // console.log("       zipFilePath: " + zipFilePath);
    // if(!fs.existsSync(zipFilePath)){ 
    //     let fd = fs.openSync(zipFilePath, "w");
    //     fs.closeSync(fd);
    // }

    // try  { 
    //     fs.accessSync(zipFilePath, fs.constants.F_OK);
    // } catch { 
    //     console.log("       " + zipArchive + "- Can not access the zip");
    //     return;
    // }

    // var output = fs.createWriteStream(zipFilePath);

    // var zipArchive = archiver('zip');
    // zipArchive.pipe(output);
    // zipArchive.directory(file, false);
    // zipArchive.finalize();
    // console.log(" ");
});

function normilizePath(path) { 
    return path.join(process.env.GITHUB_WORKSPACE, path);
}

function isDir(path) { 
    let fsStats = fs.lstatSync(path);
    console.log("       Is dir:" + path + " - " + fsStats.isDirectory());
    return fsStats.isDirectory();
}