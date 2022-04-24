'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var JSZIP = require('jszip');
var path = require('path');
var fs = require('fs');
var ssh2 = require('ssh2');
var ora = require('ora');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var JSZIP__default = /*#__PURE__*/_interopDefaultLegacy(JSZIP);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);

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
    return new Promise(async (resolve) => {
        const data = fs__default["default"].readFileSync(zipPath);
        const res = await zip.loadAsync(data);
        const files = res.files;
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

const conn = new ssh2.Client();
const connect = (server) => {
    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                err ? reject(err) : resolve(sftp); 
            });
        }).connect(server);
    })
};

const download = (remotePath, localPath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastGet(remotePath, localPath, err => {
                err ? reject(err) : resolve();
                conn.end();
            });
        });
    })
};

const upload = (localPath, remotePath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastPut(localPath, remotePath, err => {
                err ? reject(err): resolve();
                conn.end();
            });
        });
    })
};

Object.defineProperty(exports, 'ora', {
    enumerable: true,
    get: function () { return ora__default["default"]; }
});
exports.compressFile = compressFile;
exports.compressFolder = compressFolder;
exports.download = download;
exports.uncompress = uncompress;
exports.upload = upload;
