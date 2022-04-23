'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var JSZIP = require('jszip');
var path = require('path');
var fs = require('fs');
var url = require('url');
var ora = require('ora');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var JSZIP__default = /*#__PURE__*/_interopDefaultLegacy(JSZIP);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);

const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('node-tools.js', document.baseURI).href)));
path.dirname(__filename$1);

const zip = new JSZIP__default["default"]();

const readDir = (zip, dirPath) => {
    const files = fs__default["default"].readdirSync(dirPath);
    files.forEach(filename => {
        const fillPath = path__default["default"].join(dirPath, filename);
        const file = fs__default["default"].statSync(fillPath);
        if (file.isDirectory()) {
            const dirZip = zip.folder(filename);
            readDir(dirZip, fillPath);
        } else {
            zip.file(filename, fs__default["default"].readFileSync(fillPath));
        }
    });
};

const generateZip = (zip, zipPath) => {
    return new Promise((resolve) => {
        zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        }).then(content => {
            fs__default["default"].writeFileSync(zipPath, content);
            resolve();
        });
    })
};

/**
 * 压缩文件夹
 * @date 2022-04-23
 * @param {String} 待压缩的文件夹路径
 * @param {String} 压缩文件生成路径
 * @returns {Promise}
 */
const compressFolder = (localPath, zipPath) => {
    readDir(zip, localPath);
    return generateZip(zip, zipPath)
};

/**
 * 压缩文件
 * @date 2022-04-23
 * @param {String} 待压缩的文件夹路径
 * @param {String} 压缩文件生成路径
 * @returns {Promise}
 */
const compressFile = (localPath, zipPath) => {
    zip.file(path__default["default"].basename(localPath), fs__default["default"].readFileSync(localPath));
    return generateZip(zip, zipPath)
};

/**
 * 解压zip文件
 * @date 2022-04-23
 * @param {String} 待解压的文件夹路径
 * @param {String} 解压路径
 * @returns {Promise}
 */
const uncompress = async (zipPath, localPath) => {
    const res = await zip.loadAsync(fs__default["default"].readFileSync(zipPath));
    const files = res.files;
    return new Promise((resolve) => {
        for (const filename of Object.keys(files)) {
            const dest = path__default["default"].join(localPath, filename);
            if (files[filename].dir) {
                fs__default["default"].mkdirSync(dest, {
                    recursive: true
                });
            } else {
                files[filename].async('nodebuffer').then(content => {
                    fs__default["default"].writeFileSync(dest, content);
                });
            }
        }
        resolve();
    })
};

Object.defineProperty(exports, 'ora', {
    enumerable: true,
    get: function () { return ora__default["default"]; }
});
exports.compressFile = compressFile;
exports.compressFolder = compressFolder;
exports.uncompress = uncompress;
