import { compressFolder } from '../dist/tools.mjs'
const localPath = './node_modules'
const zipPath = 'zip_test.zip'
compressFolder(localPath, zipPath).then(() => {
    console.log('压缩成功')
}).catch(err => {
    console.error('压缩失败', err)
})
