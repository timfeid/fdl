<template>
  <v-app id="popup">
    <div style="margin: 1rem; width: 400px">
      <v-card v-if="info" width="100%" style="margin-bottom: 1rem">
        <v-card-text
          style="display: flex"
          :style="!currentDownload ? 'padding-bottom: 0' : ''"
        >
          <div>
            <DownloadCard v-if="currentDownload" :download="currentDownload" />

            <v-img v-else :src="info.poster" width="150" />
          </div>
          <div
            style="
              margin-left: 1rem;
              height: 230px;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            <h1 style="font-size: 1.125rem">
              {{ info.title }}
              <template v-if="info.type.name === 'series'">
                S{{ info.season.toString().padStart(2, '0')
                }}<template v-if="info.episode"
                  >E{{ info.episode.toString().padStart(2, '0') }}</template
                >
              </template>
            </h1>

            {{ info.year }}

            <p style="font-size: 0.85rem">
              {{ info.blurb }}
            </p>
          </div>
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions v-if="!currentDownload">
          <v-btn icon @click="download"><v-icon>mdi-download</v-icon></v-btn>
        </v-card-actions>
      </v-card>
      <v-btn block outlined color="primary" @click="openDownloads"
        >View all downloads</v-btn
      >
    </div>
  </v-app>
</template>

<script lang="ts">
/// <reference types="chrome"/>
import 'vuetify/dist/vuetify.min.css'
import { DownloadBundle, IncomingDownload, InfoResponse } from '@fdl/types/src'
import axios from 'axios'
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import DownloadCard from '../../../frontend/components/DownloadCard.vue'

axios.defaults.baseURL = process.env.API_LOCATION

const DownloadsStore = namespace('downloads')

@Component({
  components: {
    DownloadCard,
  },
})
export default class App extends Vue {
  msg = 'test'
  port: chrome.runtime.Port
  info: IncomingDownload | null = null

  @DownloadsStore.State downloads: DownloadBundle[]

  get currentDownload() {
    if (!this.info) {
      return
    }
    return this.downloads.find((d) => d.referrer === this.info.referrer)
  }

  mounted() {
    this.port = chrome.runtime.connect({ name: 'fdl-popup' })
    this.port.onMessage.addListener(this.onMessage)
    // this.port.onDisconnect.addListener(this.onDisconnected);
  }

  download() {
    axios.post('/downloads', {
      ...this.info,
      type: this.info.type.name,
    })
  }

  combineResponse(data: InfoResponse, info: any) {
    return {
      ...data,
      referrer: info.url,
      urls: info.urls,
    }
  }

  async recievedImdb(info: any) {
    const response = await axios.get(
      `/info/imdb/${info.imdb}/?name=${info.name}`
    )
    this.info = this.combineResponse(response.data as InfoResponse, info)
  }

  async recievedName(info: any) {
    const response = await axios.get('/info/tv-shows?query=' + info.name)
    this.info = this.combineResponse(response.data as InfoResponse, info)
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

    return this.recievedName(info)
  }

  openDownloads() {
    chrome.tabs.create({ url: process.env.BASE_URL })
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
