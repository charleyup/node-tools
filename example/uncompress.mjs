import ora from 'ora'
import { uncompress } from '../dist/node-tools.mjs'

const spinner = ora('开始压缩').start()
uncompress('./node_modules.zip', 'node_modules2').then(() => {
    spinner.succeed('解压成功')
}).catch(err => {
    spinner.fail('解压失败', err)
})