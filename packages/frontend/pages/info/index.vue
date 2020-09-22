<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-information</v-icon>
        Info
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height" fluid>
        <v-row v-if="currentInfo">
          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <DiskUsage
              :used="parseInt(currentInfo.downloadDisk.used, 10)"
              :capacity="
                parseInt(currentInfo.downloadDisk.available, 10) +
                parseInt(currentInfo.downloadDisk.used, 10)
              "
              title="Downloads"
              color="orange darken-1"
            />
          </v-col>
          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <DiskUsage
              :used="parseInt(currentInfo.nasDisk.used, 10)"
              :capacity="
                parseInt(currentInfo.nasDisk.available, 10) +
                parseInt(currentInfo.nasDisk.used, 10)
              "
              title="NAS"
              icon="mdi-server-network"
              color="green"
            />
          </v-col>
          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <DiskUsage
              :used="Math.round(currentInfo.mem.used / 1073741820)"
              :capacity="Math.round(currentInfo.mem.total / 1073741820)"
              title="RAM"
              icon="mdi-memory"
              color="blue"
            />
          </v-col>
          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <Graph
              color="indigo"
              title="CPU Usage"
              :value-property="
                (info) => parseFloat(info.currentLoad.currentload.toFixed(2))
              "
              :value="info"
              icon="mdi-cpu-64-bit"
              unit="%"
            />
          </v-col>

          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <Graph
              color="purple"
              title="DL Speed"
              :value-property="
                (info) =>
                  parseFloat((info.network[0].rx_sec / 1000000).toFixed(2))
              "
              :value="info"
              icon="mdi-speedometer"
              unit="mb/s"
            />
          </v-col>

          <v-col cols="12" md="6" xl="2" class="mb-3 mb-xl-0 py-0">
            <Graph
              color="red"
              title="CPU Temp"
              :value-property="(info) => info.temp.main"
              :value="info"
              icon="mdi-thermometer"
              unit="°C"
            />
          </v-col>
        </v-row>
        <div class="mt-5" style="width: 100%">
          <v-card>
            <v-card-title>
              Downloads
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="downloads"
              :search="search"
            >
              <template v-slot:[`item.title`]="{ item }">
                <v-icon class="mr-1">{{ icon(item.type.name) }}</v-icon>
                {{ item.title }}
              </template>
              <template v-slot:[`item.info`]="{ item }">
                {{ seriesInfo(item) }}
              </template>
              <template v-slot:[`item.size`]="{ item }">
                {{
                  (
                    item.urls
                      .map((d) => d.contentLength)
                      .reduce((a, b) => a + b) / 1073741824
                  ).toFixed(2)
                }}GB
              </template>
              <template v-slot:[`item.createdAt`]="{ item }">
                {{ timeago(item.createdAt) }}
              </template>
              <template v-slot:[`item.diff`]="{ item }">
                {{ item.step === 'complete' ? diff(item) : '—' }}
              </template>
              <template v-slot:[`item.urls`]="{ item }">
                {{ item.urls.length }}
              </template>
              <template v-slot:[`item.step`]="{ item }">
                {{ item.step.charAt(0).toUpperCase() }}{{ item.step.substr(1) }}
              </template>
              <template v-slot:[`item.blurb`]="{ item }">
                <div class="movie-blurb" :style="`width: ${blurbWidth}`">
                  {{ item.blurb }}
                </div>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </v-container>
    </v-layout>
  </div>
</template>
<script lang="ts">
import { DownloadBundle, SystemInformation } from '@fdl/types'
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import moment from 'moment'

const DownloadsStore = namespace('downloads')

@Component
export default class InfoIndex extends Vue {
  @DownloadsStore.State downloads: DownloadBundle[]
  @DownloadsStore.State info: SystemInformation[]

  get currentInfo() {
    return this.info ? this.info[this.info.length - 1] : null
  }

  search = ''
  headers = [
    {
      text: 'Title',
      align: 'start',
      value: 'title',
    },
    { text: ' ', value: 'info' },
    { text: 'Size', value: 'size' },
    { text: 'Added', value: 'createdAt' },
    { text: 'Completed in', value: 'diff' },
    { text: 'Air Date', value: 'year' },
    { text: 'Blurb', value: 'blurb' },
    { text: 'URLs', value: 'urls' },
    { text: 'Status', value: 'step' },
  ]

  timeago(date: string) {
    return moment(date).fromNow()
  }

  icon(type: string) {
    if (type === 'series') {
      return 'mdi-television'
    }

    return 'mdi-movie'
  }

  diff(item: DownloadBundle) {
    const diff = moment.duration(
      moment(item.completedAt).diff(moment(item.startedAt))
    )

    const times = []
    const hours = Math.floor(diff.asHours())
    if (hours) {
      times.push(hours)
    }
    times.push(diff.minutes().toString().padStart(2, '0'))
    times.push(diff.seconds().toString().padStart(2, '0'))

    return times.join(':')
  }

  seriesInfo(bundle: DownloadBundle) {
    let str = ''
    if (bundle.type.name === 'series') {
      str += `S${bundle.season.toString().padStart(2, '0')}`
      if (bundle.episode) {
        str += `E${bundle.episode.toString().padStart(2, '0')}`
      }
    }

    return str
  }

  get blurbWidth() {
    switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return '220px'
      case 'sm':
        return '400px'
      case 'md':
        return '500px'
      case 'lg':
        return '600px'
      case 'xl':
        return '800px'
    }
  }
}
</script>

<style lang="scss">
.movie-blurb {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
