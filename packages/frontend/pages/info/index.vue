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
        <v-row>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="285.55"
              capacity="491.18"
              title="Download Path"
              color="orange darken-1"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="10244.53"
              capacity="15444.68"
              title="NAS"
              icon="mdi-server-network"
              color="green"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="20.7"
              capacity="31"
              title="RAM"
              icon="mdi-memory"
              color="blue"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="indigo" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
                    padding="24"
                    stroke-linecap="round"
                    smooth
                    fill
                    show-labels
                  >
                  </v-sparkline>
                </v-sheet>
              </v-card-text>

              <v-card-title class="pt-0">
                <v-icon large left>mdi-cpu-64-bit</v-icon>
                <div>CPU Usage</div>
                <div class="ml-auto font-weight-thin">1.2%</div>
              </v-card-title>
            </v-card>
          </v-col>

          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="purple" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
                    padding="24"
                    stroke-linecap="round"
                    smooth
                    fill
                    show-labels
                  >
                  </v-sparkline>
                </v-sheet>
              </v-card-text>

              <v-card-title style="padding-top: 1px !important">
                <v-icon large left>mdi-speedometer</v-icon>
                <div>Download Speed</div>
                <div class="ml-auto font-weight-thin">110mb/s</div>
              </v-card-title>
            </v-card>
          </v-col>

          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="red" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
                    padding="24"
                    stroke-linecap="round"
                    smooth
                    fill
                    show-labels
                  >
                  </v-sparkline>
                </v-sheet>
              </v-card-text>

              <v-card-title style="padding-top: 1px !important">
                <v-icon large left>mdi-thermometer</v-icon>
                <div>CPU Temperature</div>
                <div class="ml-auto font-weight-thin">32ø</div>
              </v-card-title>
            </v-card>
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
              <template v-slot:[`item.createdAt`]="{ item }">
                {{ timeago(item.createdAt) }}
              </template>
              <template v-slot:[`item.updatedAt`]="{ item }">
                {{ timeago(item.updatedAt) }}
              </template>
              <template v-slot:[`item.urls`]="{ item }">
                {{ item.urls.length }}
              </template>
              <template v-slot:[`item.step`]="{ item }">
                {{ item.step.charAt(0).toUpperCase() }}{{ item.step.substr(1) }}
              </template>
            </v-data-table>
          </v-card>
        </div>
      </v-container>
    </v-layout>
  </div>
</template>
<script lang="ts">
import { DownloadBundle } from '@fdl/types'
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import moment from 'moment'

const DownloadsStore = namespace('downloads')

@Component
export default class InfoIndex extends Vue {
  @DownloadsStore.State downloads: DownloadBundle[]
  value = [3.1, 4.2, 4.3, 3.1, 2.6, 1.1, 3.7, 4.1, 2.9, 3.2]

  labels = ['10s', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s', '1s']

  search = ''
  headers = [
    {
      text: 'Title',
      align: 'start',
      value: 'title',
    },
    { text: ' ', value: 'info' },
    { text: 'Added', value: 'createdAt' },
    { text: 'Updaed', value: 'updatedAt' },
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
}
</script>
