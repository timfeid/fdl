import {Server} from 'http'
import socketIO from 'socket.io'
import Koa from 'koa'
import { DownloadBundle } from '.'

export function createSocketIo (server: Server, app: Koa) {
  const io = socketIO(server)

  io.on('connection', socket => {
    console.log(socket)
  })

  app.on('download-progress', (progress: DownloadBundle) => {
    io.emit('download-progress', progress)
  })

  return io
}