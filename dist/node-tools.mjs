import JSZIP from 'jszip';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export { default as ora } from 'ora';

const __filename = fileURLToPath(import.meta.url);
dirname(__filename);

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
    const res = await zip.loadAsync(fs.readFileSync(zipPath));
    const files = res.files;
    return new Promise((resolve) => {
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

export { compressFile, compressFolder, uncompress };
