import { Client } from 'ssh2'
const conn = new Client()
const connect = (server) => {
    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                err ? reject(err) : resolve(sftp) 
            })
        }).connect(server)
    })
}

const download = (remotePath, localPath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastGet(remotePath, localPath, err => {
                err ? reject(err) : resolve()
                conn.end()
            })
        })
    })
}

const upload = (localPath, remotePath, server) => {
    return new Promise((resolve, reject) => {
        connect(server).then(sftp => {
            sftp.fastPut(localPath, remotePath, err => {
                err ? reject(err): resolve()
                conn.end()
            })
        })
    })
}

export {
    download,
    upload
}