#!/usr/bin/env node

const sf = require('./splitFile');
const mf = require('./mergeFiles');
const packageData = require('./package.json');

function showNilResponse() {
    console.log("Sorry, please use -h for help!")
}
function showHelpInfo() {
    let infoText = `
-v: view the version info
-h: view the help info
-s: split the files in relevant folder into some pieces
-m: merge the splitted files in relevant folder into one

* Args should be used like the examples shown below: 
* 1. cmd  2. source-path  3. output-path 4. piecies
* The absolute path is needed for 2nd and 3rd arg.
* Put your files to be splitted into a folder. 
* eg: 
* splitee -s D:/folderThatContainsFiles2BeSplitted D:/outputFolder 10
* splitee -m D:/outputFolder D:/outputFolder4MergedFiles
`;
    console.log(infoText);
}


function RespondToArgs() {
    const args = process.argv.slice(2);
    if (args.length <= 1) {
        switch (args[0]) {
            case '-v':
                console.log(`Current version is ${packageData.version}, by Alexander Ezharjan(${packageData.email}).`);
                break;
            case '-h':
                showHelpInfo();
                break;
            case '-s':
            case '-m':
                console.log("Invalid single arg! Please input the whole args!")
                break;
            case '':
            case '.':
            default:
                showNilResponse();
                break;
        }
    } else {
        if ((args[1] != undefined || args[1] != null || args[1] != '')
            && args[2] != undefined || args[2] != null || args[2] != '') {
            switch (args[0]) {
                case '-s':
                    if (args[3]) {
                        sf.SplitRecursively(args[1], parseInt(args[3]), args[2]);
                    } else {
                        console.log("Please input the 3rd arg as the total count of the pieces you want.");
                    }
                    break;
                case '-m':
                    mf.MergeRecursively(args[1], args[2]);
                    break;
                default:
                    showNilResponse();
                    break;
            }
        } else {
            console.warn('Invalid path!');
        }
    }
}

RespondToArgs();