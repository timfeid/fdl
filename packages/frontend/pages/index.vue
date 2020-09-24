<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-download</v-icon>
        Downloads
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height flex-column align-start" fluid>
        <div class="d-flex flex-wrap">
          <template v-for="download in downloads">
            <div
              :key="download.id"
              :style="`margin: 0 2rem 2rem 0px; max-width: 150px; height: ${height}px`"
            >
              <DownloadCard
                :download="download"
                @height="newHeight"
              />
            </div>
          </template>
        </div>
      </v-container>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { DownloadBundle } from '@fdl/types'

const downloads = namespace('downloads')

@Component
export default class Index extends Vue {
  @downloads.State downloads!: DownloadBundle[]
  height = 200
  newHeight (height: number) {
    console.log(height)
    this.height = height
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
    color: rgba(0, 0, 0, 0.4);
  }
}
</style>
