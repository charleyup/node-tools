import { Client } from 'ssh2'
const conn = new Client()
const connect = (server) => {
    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                err ? resolve(sftp) : reject(err)
            })
        }).connect(server)
    })
}

const download = (remotePath, localPath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastGet(remotePath, localPath, err => {
                err ? resolve() : reject(err)
            })
        })
    })
}

const upload = (localPath, remotePath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastPut(localPath, remotePath, err => {
                err ? resolve() : reject(err)
            })
        })
    })
}

export {
    download,
    upload
}