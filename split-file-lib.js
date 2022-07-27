const Promise = require("bluebird");
const fs = require("fs");
const { basename, resolve } = require("path");

/**
 * Split File module.
 */
let SplitFile = function () { };

/**
 * Split file into number of parts
 * @param {string} file
 * @param {number} parts
 *
 * @returns {Promise}
 */
SplitFile.prototype.splitFile = function (file, parts, dest) {
  let self = this;

  // Validate parameters.
  if (parts < 1) {
    return Promise.reject(new Error("Parameter 'parts' is invalid, must contain an integer value."));
  }

  return Promise.promisify(fs.stat)(file).then(function (stat) {
    if (!stat.isFile) {
      return Promise.reject(new Error("Given file is not valid"));
    }
    if (!stat.size) {
      return Promise.reject(new Error("File is empty"));
    }

    let totalSize = stat.size;
    let splitSize = Math.floor(totalSize / parts);

    // If size of the parts is 0 then you have more parts than bytes.
    if (splitSize < 1) {
      return Promise.reject(new Error("Too many parts, or file too small!"));
    }

    // Get last split size, this is different from the others because it uses scrap value.
    let lastSplitSize = splitSize + (totalSize % parts);

    // Capture the partinfo in here:
    let partInfo = [];

    // Iterate the parts
    for (let i = 0; i < parts; i++) {
      partInfo[i] = {
        number: i + 1,

        // Set buffer read start position
        start: i * splitSize,

        // Set total ending position
        end: i * splitSize + splitSize,
      };

      if (i === parts - 1) {
        partInfo[i].end = i * splitSize + lastSplitSize;
      }
    }

    return self.__splitFile(file, partInfo, dest);
  });
};

/**
 * Split file into multiple parts based on max part size given
 * @param {string} file
 * @param {string} maxSize max part size in BYTES!
 * @returns {Promise}
 */
SplitFile.prototype.splitFileBySize = function (file, maxSize, dest) {
  let self = this;

  return Promise.promisify(fs.stat)(file).then(function (stat) {
    if (!stat.isFile) {
      return Promise.reject(new Error("Given file is not valid"));
    }
    if (!stat.size) {
      return Promise.reject(new Error("File is empty"));
    }

    let totalSize = stat.size;

    // Number of parts (exclusive last part!)
    let parts = Math.ceil(totalSize / maxSize);
    let splitSize = Math.round(maxSize);

    // If size of the parts is 0 then you have more parts than bytes.
    if (splitSize < 1) {
      return Promise.reject(new Error("Too many parts, or file too small!"));
    }

    // Capture the partinfo in here:
    let partInfo = [];

    // Iterate the parts
    for (let i = 0; i < parts; i++) {
      partInfo[i] = {
        number: i + 1,

        // Set buffer read start position
        start: i * splitSize,

        // Set total ending position
        end: i * splitSize + splitSize,
      };
    }

    // recalculate the size of the last chunk
    partInfo[partInfo.length - 1].end = totalSize;

    return self.__splitFile(file, partInfo, dest);
  });
};

/**
 * Merge input files to output file.
 * @param {string[]} inputFiles
 * @param {string} outputFile
 *
 * @returns {Promise}
 */
SplitFile.prototype.mergeFiles = function (inputFiles, outputFile) {
  // Validate parameters.
  if (inputFiles.length <= 0) {
    return Promise.reject(new Error("Make sure you input an array with files as first parameter!"));
  }

  let writer = fs.createWriteStream(outputFile, {
    encoding: null,
  });

  return Promise.mapSeries(inputFiles, function (file) {
    return new Promise(function (resolve, reject) {
      let reader = fs.createReadStream(file, { encoding: null });
      reader.pipe(writer, { end: false });
      reader.on("error", reject);
      reader.on("end", resolve);
    });
  }).then(function () {
    writer.close();
    return Promise.resolve(outputFile);
  });
};

/**
 * Split the file, given by partinfos and filepath
 * @access private
 * @param {string} file
 * @param {object} partInfo
 *
 * @returns {Promise}
 */
SplitFile.prototype.__splitFile = function (file, partInfo, dest) {
  // Now the magic. Read buffers with length..
  let partFiles = [];

  return Promise.mapSeries(partInfo, function (info) {
    return new Promise(function (resolve, reject) {
      // Open up a reader
      let reader = fs.createReadStream(file, {
        encoding: null,
        start: info.start,
        end: info.end - 1,
      });

      // Part name (file name of part)
      // get the max number of digits to generate for part number
      // ex. if original file is split into 4 files, then it will be 1
      // ex. if original file is split into 14 files, then it will be 2
      // etc.
      let maxPaddingCount = String(partInfo.length).length;
      // initial part number
      // ex. '0', '00', '000', etc.
      let currentPad = "";
      for (let i = 0; i < maxPaddingCount; i++) {
        currentPad += "0";
      }
      // construct part number for current file part
      // <file>.sf-part01
      // ...
      // <file>.sf-part14
      let unpaddedPartNumber = "" + info.number;
      let partNumber = currentPad.substring(0, currentPad.length - unpaddedPartNumber.length) + unpaddedPartNumber;
      let partName = file + ".sf-part" + partNumber;

      const outputFile = (filename) => {
        const writer = fs.createWriteStream(filename);
        const pipe = reader.pipe(writer);
        pipe.on("error", reject);
        pipe.on("finish", resolve);
      };

      if (dest) {
        const filename = basename(partName);
        if (dest.charAt(dest.length - 1) !== "/") {
          dest += "/";
        }
        outputFile(dest + filename);
        partFiles.push(dest + filename);
      } else {
        outputFile(partName);
        partFiles.push(partName);
      }
      // Pipe reader to writer
    });
  }).then(function () {
    return Promise.resolve(partFiles);
  });
};

module.exports = new SplitFile();
