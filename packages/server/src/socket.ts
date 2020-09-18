import {Server} from 'http'
import socketIO from 'socket.io'
import Koa from 'koa'
import { DownloadBundle } from '@fdl/info'

export function createSocketIo (server: Server, app: Koa) {
  const io = socketIO(server)

  io.on('connection', socket => {
    // console.log(socket)
    console.log('a socket has connected.')
  })

  app.on('download-queued', (download: DownloadBundle) => {
    io.emit('download-queued', download)
  })

  app.on('download-progress', (progress: DownloadBundle) => {
    io.emit('download-progress', progress)
  })

  return io
}
