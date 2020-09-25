import {Server} from 'http'
import socketIO, { Socket } from 'socket.io'
import Koa from 'koa'
import { SystemInformation, DownloadBundle, DiskInfo } from '@fdl/types'
// eslint-disable-next-line
// @ts-ignore
import df from 'node-df'
import si from 'systeminformation'
import { config } from '@fdl/config'
import { logger } from '../../logger/src'

const infos: SystemInformation[] = []

async function getFolderInfo (file: string): Promise<DiskInfo> {
  const options = {
    prefixMultiplier: 'GB',
    isDisplayPrefixMultiplier: true,
    precision: 2
  }

  return new Promise((resolve, reject) => {
    df({...options, file }, (err: Error, folder: any) => {
      if (err) {
        reject(err)
      }
      resolve(folder[0])
    })
  })
}

async function getInfo (io: socketIO.Server) {
  const eth = await si.networkInterfaceDefault()
  const [
    downloadDisk,
    nasDisk,
    cpu, time, os, temp, currentLoad, mem,
    network,
  ] = await Promise.all([
    getFolderInfo(config.downloadPath),
    getFolderInfo(config.contentPath),
    si.cpu(),
    si.time(),
    si.osInfo(),
    si.cpuTemperature(),
    si.currentLoad(),
    si.mem(),
    si.networkStats(eth),
  ])

  const info: SystemInformation = {
    downloadDisk,
    nasDisk,
    cpu,
    time,
    os,
    temp,
    currentLoad,
    mem,
    network,
  }
  infos.push(info)

  if (infos.length > 10) {
    infos.shift()
  }

  io.emit('info', infos)

  setTimeout(() => getInfo(io), 5000)
}

export function createSocketIo (server: Server, app: Koa) {
  const io = socketIO(server)

  io.on('connection', socket => {
    logger.verbose('a socket has connected.')
  })

  app.on('download-queued', (download: DownloadBundle) => {
    io.emit('download-queued', download)
  })

  app.on('download-progress', (progress: DownloadBundle) => {
    io.emit('download-progress', progress)
  })

  getInfo(io)

  return io
}
