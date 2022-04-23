import ora from 'ora'
import { compressFolder } from '../dist/node-tools.mjs'
const localPath = './node_modules'
const zipPath = 'node_modules.zip'
const spinner = ora('开始压缩').start()
compressFolder(localPath, zipPath).then(() => {
    spinner.succeed('压缩成功')
}).catch(err => {
    console.error('压缩失败', err)
})
