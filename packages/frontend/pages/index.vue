<template>
  <v-layout class="align-baseline">
    <div class="d-flex flex-wrap">
      <template v-for="download in downloads">
        <div
          :key="download.id"
          style="margin: 0 2rem 2rem 0px; max-width: 150px"
        >
          <v-card class="mb-2">
            <v-img :src="download.poster" width="150" height="230"></v-img>
            <v-progress-linear
              :value="progress(download)"
              :color="color(download)"
            />
          </v-card>
          <div class="movie-title">
            {{ download.title }}
          </div>
          <div class="movie-year">{{ download.year }}</div>
          <div class="movie-added-date">2 days ago</div>
        </div>
      </template>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { DownloadBundle } from '@fdl/server'

const downloads = namespace('downloads')

@Component
export default class Index extends Vue {
  @downloads.State downloads: DownloadBundle[]

  color(download: DownloadBundle) {
    switch (download.step) {
      case 'complete':
        return 'green'
      case 'queue':
        return 'brown'
      case 'extract':
        return 'orange'
      case 'download':
        return 'blue'
    }

    return 'red'
  }

  progress(download: DownloadBundle) {
    switch (download.step) {
      case 'complete':
        return 100
      case 'extract':
        return download.extraction.progress
      case 'download':
        return (
          download.downloads.reduce((val, d) => val + d.downloaded, 0) /
          download.downloads.reduce((val, d) => val + d.contentLength, 0)
        )
      default:
        return 0
    }
  }
}
</script>

<style lang="scss">
.movie {
  &-title {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 0.85rem;
  }
  &-year,
  &-added-date {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
