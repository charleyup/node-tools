import JSZIP from 'jszip'
import path from 'path'
import fs from 'fs'
import { __dirname } from './utils.mjs'
const zip = new JSZIP()

const readDir = (zip, dirPath) => {
    const files = fs.readdirSync(dirPath)
    files.forEach(filename => {
        const fillPath = path.join(dirPath, filename)
        const file = fs.statSync(fillPath)
        if (file.isDirectory()) {
            const dirZip = zip.folder(filename)
            readDir(dirZip, fillPath)
        } else {
            zip.file(filename, fs.readFileSync(fillPath))
        }
    });
}

const compress = (localPath, zipPath) => {
    // const rootFolder = zip.folder(path.basename(localPath))
    readDir(zip, localPath)
    return new Promise((resolve, reject) => {
        zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        }).then(content => {
            fs.writeFileSync(zipPath, content)
            resolve()
        })
    })
}

const uncompress = async (zipPath, localPath) => {
    const res = await zip.loadAsync(fs.readFileSync(zipPath))
    const files = res.files
    return new Promise((resolve) => {
        for (const filename of Object.keys(files)) {
            const dest = path.join(localPath, filename);
            if (files[filename].dir) {
                fs.mkdirSync(dest, {
                    recursive: true
                })
            } else {
                files[filename].async('nodebuffer').then(content => {
                    fs.writeFileSync(dest, content)
                })
            }
        }
        resolve()
    })
}

export {
    compress,
    uncompress
}