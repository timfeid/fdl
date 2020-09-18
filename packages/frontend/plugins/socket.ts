import io from 'socket.io-client'
import { Plugin } from '@nuxt/types'
import {DownloadBundle} from '@fdl/info'
import {Store} from 'vuex'

function createSocket (store: Store<any>) {
  const socket = io('http://localhost:4242')

  // socket.on('connect', () => {
  // })

  socket.on('download-progress', (download: DownloadBundle) => {
    store.commit('downloads/update', download)
  })

  socket.on('download-queued', (download: DownloadBundle) => {
    store.commit('downloads/add', download)
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

const plugin: Plugin = function ({store}, inject) {
  inject('socket', createSocket(store))
}

export default plugin
