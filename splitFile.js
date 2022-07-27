let fs = require('fs');
const async = require('async');
const utils = require('./utils');
const splitFile = require('./split-file-lib');

function Split(sourcePath, parts, destPath) {
    let _sourcePath = sourcePath.replaceAll("\\\\", "\\/"); //replace all the \ to /
    let _destPath = destPath.replaceAll("\\\\", "\\/");
    splitFile.splitFile(_sourcePath, parts, _destPath)
        .then((names) => {
            console.log(names);
        })
        .catch((err) => {
            console.log('Error: ', err);
        });
}

function SplitRecursively(srcDir, parts, destDir) {
    let _srcDir = srcDir.replaceAll("\\\\", "\\/"); //replace all the \ to /
    let _destDir = destDir.replaceAll("\\\\", "\\/");
    let fileList = utils.FileUtil.getFileList(_srcDir);
    async.each(fileList, function (item, callback) {
        let fileName = utils.FileUtil.getFileName(item.path);
        let eachFileFolder = _destDir + "/" + fileName //create a folder for every single file
        utils.FileUtil.createFolder(eachFileFolder);
        Split(_srcDir + "/" + fileName, parts, eachFileFolder)
    }, function (err, resp) {
        if (err) {
            console.log("err :", err);
        } else {
            console.log(`Splited ${fileName}!`);
        }
    });
    // console.log("Successfully splitted!");
}


module.exports = { "SplitRecursively": SplitRecursively }