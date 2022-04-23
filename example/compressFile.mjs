import { compressFile } from '../src/zip.mjs'
const localPath = './package.json'
const zipPath = 'zip_test.zip'
compressFile(localPath, zipPath).then(() => {
    console.log('压缩成功')
}).catch(err => {
    console.error('压缩失败', err)
})
