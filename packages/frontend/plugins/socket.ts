import io from 'socket.io-client'
import { Plugin } from '@nuxt/types'
import { DiskInfo, DownloadBundle } from '@fdl/types'
import { Store } from 'vuex'

export function createSocket(store: Store<any>) {
  console.log(process.env)
  const socket = io(process.env.API_LOCATION)

  // socket.on('connect', () => {
  // })

  socket.on('download-progress', (download: DownloadBundle) => {
    store.commit('downloads/update', download)
  })

  socket.on('download-queued', (download: DownloadBundle) => {
    store.commit('downloads/add', download)
  })

  socket.on('info', (info: DiskInfo) => {
    store.commit('downloads/info', info)
  })

  return socket
}

declare module 'vue/types/vue' {
  interface Vue {
    $socket: SocketIOClient.Socket
  }
}

declare module '@nuxt/types' {
  interface Context {
    $socket: SocketIOClient.Socket
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $socket: SocketIOClient.Socket
  }
}

const plugin: Plugin = function ({ store }, inject) {
  inject('socket', createSocket(store))
}

export default plugin
