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
console.log("\tDir: " + dir);
console.log("Programm: ")
const rootDir = normilizePath(dir);
console.log("\ŧrootDir: " + rootDir);

if(!fs.existsSync(rootDir)){ 
    console.log("\t" + rootDir + " - Not Found");
    return;
}

/*TODO check if dir*/

let fileObjects = fs.readdirSync(rootDir);

console.log("\tCurrent directory filenames:"); 

let fullQualityPaths = fileObjects.map(file => { 
    let filePath = normilizePath(file);
    console.log("\t\tFile: " + file + " Path: " + filePath);
    return filePath;
});
console.log("\ŧRun:"); 

fullQualityPaths.forEach(filePath => {
    console.log("\t\tCurrent file: "  + filePath);

    // check if folder
    // let fsStats = fs.lstatSync(filePath);
    // if(!fsStats.isDirectory()){ 
    //     console.log("\t\ŧIs not a directory -> skip");
    //     return;
    // }

    // if(!isDir(filePath)) { 
    //     return;
    // }
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

function normilizePath(filePath) { 
    return path.join(process.env.GITHUB_WORKSPACE, filePath);
}