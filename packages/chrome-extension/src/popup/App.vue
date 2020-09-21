<template>
  <div>
    <DownloadCard v-if="info" :download="info" />
    <button @click="doShit">do hsit</button>
  </div>
</template>

<script lang="ts">
/// <reference types="chrome"/>
import { IncomingDownload, InfoResponse } from '@fdl/types/src'
import axios from 'axios'
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import DownloadCard from '../../../frontend/components/DownloadCard.vue'

@Component({
  components: {
    DownloadCard,
  },
})
export default class App extends Vue {
  msg = 'test'
  port: chrome.runtime.Port
  info: IncomingDownload | null = null

  mounted() {
    this.port = chrome.runtime.connect({ name: 'fdl-popup' })
    this.port.onMessage.addListener(this.onMessage)
    // this.port.onDisconnect.addListener(this.onDisconnected);
  }

  async recievedImdb(info: any) {
    const response = await axios.get(
      'http://localhost:4242/info/movies?imdb=' + info.imdb
    )
    const data: InfoResponse = response.data
    console.log(data)
    this.info = {
      ...data,
      referrer: info.url,
      urls: info.urls,
    }
  }

  onMessage(message: any) {
    if (message.type === 'parseTab') {
      this.recievedParseTab(message.payload)
    }
  }

  recievedParseTab(info: any) {
    if (info.imdb) {
      return this.recievedImdb(info)
    }
  }

  listener(wat: any) {
    console.log(wat)
  }

  doShit() {
    this.port.postMessage({ type: 'parseTab' })
  }
}
</script>

<style>
p {
  font-size: 20px;
}
body {
  background: #fff !important;
}
</style>
