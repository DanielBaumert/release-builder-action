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

fullQualityDir.forEach(f => { 
    console.log("        Current directory: "  + f);

    let fZip = f + ".zip";  

    fs.access(f, fs.constants.F_OK, (err) => { 
        if(err) { 
            console.error("        Could not acces the " + f);
            return;
        }

        fs.access(fZip, fs.constants.F_OK | fs.constants.W_OK, (err) => { 
            if(err) { 
                if(err.code === 'ENOENT') { 
                    var fd = fs.openSync(fZip, "w");
                    fs.closeSync(fd);
                } else { 
                    console.error("        Could not acces the " + fZip);
                    return;
                }                
            }

            var output = fs.createWriteStream(fZip);

            var zipArchive = archiver('zip');
            zipArchive.pipe(output);
            zipArchive.directory(f, false);
            zipArchive.finalize();
            console.log(" ");

        });
    });
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