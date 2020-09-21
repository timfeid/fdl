<template>
  <v-app id="popup">
    <div style="margin: 1rem; width: 400px">
      <v-card v-if="info" width="100%" style="margin-bottom: 1rem">
        <v-card-text style="display: flex; max-height: 240px">
          <div>
            <v-img :src="info.poster" width="150" />
          </div>
          <div
            style="
              margin-left: 1rem;
              height: 220px;
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
        <v-card-actions>
          <v-btn icon @click="download"><v-icon>mdi-download</v-icon></v-btn>
        </v-card-actions>
      </v-card>
      <v-btn block outlined color="primary" @click="openDownloads">View all downloads</v-btn>
    </div>
  </v-app>
</template>

<script lang="ts">
/// <reference types="chrome"/>
import 'vuetify/dist/vuetify.min.css'
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

  download() {
    axios.post('http://localhost:4242/downloads', {
      ...this.info,
      type: this.info.type.name,
    })
  }

  async recievedImdb(info: any) {
    const response = await axios.get(
      'http://localhost:4242/info/movies?imdb=' + info.imdb
    )
    const data: InfoResponse = response.data
    this.info = {
      ...data,
      referrer: info.url,
      urls: info.urls,
    }
  }

  async recievedName(info: any) {
    const response = await axios.get(
      'http://localhost:4242/info/tv-shows?query=' + info.name
    )
    const data: InfoResponse = response.data
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
    console.log('asdksnfdjgf')
    if (info.imdb) {
      return this.recievedImdb(info)
    }

    return this.recievedName(info)
  }

  openDownloads () {
    chrome.tabs.create({ url: 'http://localhost:3000' })
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
