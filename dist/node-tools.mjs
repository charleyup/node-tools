import JSZIP from 'jszip';
import path from 'path';
import fs from 'fs';
import { Client } from 'ssh2';
export { default as ora } from 'ora';

const zip = new JSZIP();

const readDir = (zip, dirPath) => {
    const files = fs.readdirSync(dirPath);
    files.forEach(filename => {
        const fillPath = path.join(dirPath, filename);
        const file = fs.statSync(fillPath);
        if (file.isDirectory()) {
            const dirZip = zip.folder(filename);
            readDir(dirZip, fillPath);
        } else {
            zip.file(filename, fs.readFileSync(fillPath));
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
            fs.writeFileSync(zipPath, content);
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
    zip.file(path.basename(localPath), fs.readFileSync(localPath));
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
        const data = fs.readFileSync(zipPath);
        const res = await zip.loadAsync(data);
        const files = res.files;
        for (const filename of Object.keys(files)) {
            const dest = path.join(localPath, filename);
            if (files[filename].dir) {
                fs.mkdirSync(dest, {
                    recursive: true
                });
            } else {
                files[filename].async('nodebuffer').then(content => {
                    fs.writeFileSync(dest, content);
                });
            }
        }
        resolve();
    })
};

const conn = new Client();
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

export { compressFile, compressFolder, download, uncompress, upload };
