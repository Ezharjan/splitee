const async = require('async');
const utils = require('./utils');
const splitFile = require('./split-file-lib');


function Merge(srcDir, outputFilePath) {
    let _srcDir = srcDir.replaceAll("\\\\", "\\/"); //replace all the \ to /
    let _outputFilePath = outputFilePath.replaceAll("\\\\", "\\/");
    let names = [];
    let fileList = utils.FileUtil.getFileList(_srcDir);
    async.each(fileList, function (item, callback) {
        let filePath = _srcDir + "/" + utils.FileUtil.getFileName(item.path);
        names.push(filePath);
    }, function (err, resp) {
        if (err) {
            console.log(err);
        } else {
            console.log('Got filePath correctly!');
        }
    });

    utils.FileUtil.createFolder(_outputFilePath, 1);
    splitFile.mergeFiles(names, _outputFilePath)
        .then(() => {
            // console.log(`Merged!`);
        })
        .catch((err) => {
            console.log(err);
        });
}

function MergeRecursively(srcDir, outputDir) {
    let _srcDir = srcDir.replaceAll("\\\\", "\\/"); //replace all the \ to /
    let _outputDir = outputDir.replaceAll("\\\\", "\\/");
    let fileList = utils.FileUtil.getFileList(_srcDir);
    async.each(fileList, function (item, callback) {
        let fileName = utils.FileUtil.getFileName(item.path);
        let fileNameArr = fileName.toString().split(".sf");
        if (fileNameArr.length > 0) {
            let eachFileFolder = _srcDir + "/" + fileNameArr[0];
            Merge(eachFileFolder, _outputDir + "/" + fileNameArr[0]);
        } else {
            console.log(`The directory ${_srcDir} is empty!`);
        }
    }, function (err, resp) {
        if (err) {
            console.log(err);
        } else {
            console.log(`${fileName}`);
        }
    });
    console.log("Successfully merged!");
}


module.exports = { "MergeRecursively": MergeRecursively }