let fs = require('fs');


function geFileList(path) {
    let filesList = [];
    readFile(path, filesList);
    return filesList;
}

function readFile(path, filesList) {
    files = fs.readdirSync(path);
    files.forEach(walk);
    function walk(file) {
        states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList);
        }
        else {
            let obj = new Object();
            obj.size = states.size;
            obj.name = file;
            obj.path = path + '/' + file;
            filesList.push(obj);
        }
    }
}

let getFileName = function (path) {
    let pathList = path.split("/");
    let fileName = pathList[pathList.length - 1];
    return fileName;
};


let getFileContent = function (filePath, cb) {
    fs.readFile(filePath, function (err, buf) {
        cb(err, buf);
    });
};

let writeFileSync = function (filePath, text) {
    fs.writeFileSync(filePath, text);
};

let writeFileAsync = function (filePath, text, cb) {
    fs.writeFile(filePath, text, function (err) {
        cb(err);
    });
};


let createFolder = function (folderPath, tailCursor) {
    let dirArr = folderPath.toString().split("/");
    let dynamicPth = "";
    let bSucceed = false;
    for (let i = 0; i < dirArr.length; i++) {
        try {
            bSucceed = true;
            if (tailCursor && i >= dirArr.length - tailCursor) {
                break;
            }
            dynamicPth += (i == 0 ? "" : "/") + dirArr[i];
            (!fs.existsSync(dynamicPth)) && fs.mkdirSync(dynamicPth);
        } catch (err) {
            console.log(err);
            bSucceed = false;
        }
    }
    return bSucceed;
}


module.exports = {
    "FileUtil": {
        "getFileList": geFileList,
        "getFileName": getFileName,
        "writeFileAsync": writeFileAsync,
        "writeFileSync": writeFileSync,
        "getFileContent": getFileContent,
        "createFolder": createFolder,
    },
};