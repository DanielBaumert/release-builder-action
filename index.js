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
const root = path.join(process.env.GITHUB_WORKSPACE, dir);

console.log("Input: ")
console.log("    Dir: " + dir);
console.log("Programm: ")

if(!fs.existsSync(rootDir)){ 
    console.error("    " + rootDir + " - Not Found");
    return;
}

const normilizePath = (filePath) => path.join(root, filePath);

console.log("    rootDir: " + rootDir);

/*TODO check if dir*/

const fileObjects = fs.readdirSync(root);

console.log("    Current directory filenames:"); 

const fullQualityPaths = fileObjects.map(file => { 
    let filePath = normilizePath(file);
    console.log("        File: " + file + " Path: " + filePath);
    return filePath;
});

console.log("    Run:");

const fullQualityDir = fullQualityPaths.filter(f => fs.statSync(f).isDirectory());

fullQualityDir.forEach(f => { 
    console.log("        Current directory: "  + filePath);
});

// fullQualityPaths.forEach(filePath => {

//     // if(!isDir(filePath)) { 
//     //     return;
//     // }
//     // // zip
//     // try { 
//     //     fs.accessSync(file, fs.constants.F_OK);
//     // } catch {
//     //     console.log("       " + file + " - Can not access the directory");
//     //     return;
//     // }

//     // const zipFilePath = file + ".zip";
//     // console.log("       zipFilePath: " + zipFilePath);
//     // if(!fs.existsSync(zipFilePath)){ 
//     //     let fd = fs.openSync(zipFilePath, "w");
//     //     fs.closeSync(fd);
//     // }

//     // try  { 
//     //     fs.accessSync(zipFilePath, fs.constants.F_OK);
//     // } catch { 
//     //     console.log("       " + zipArchive + "- Can not access the zip");
//     //     return;
//     // }

//     // var output = fs.createWriteStream(zipFilePath);

//     // var zipArchive = archiver('zip');
//     // zipArchive.pipe(output);
//     // zipArchive.directory(file, false);
//     // zipArchive.finalize();
//     // console.log(" ");
// });