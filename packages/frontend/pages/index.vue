<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-download</v-icon>
        Downloads
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height" fluid>
        <div style="display: block; width: 100%">
          <div
            :style="`display: grid; grid-template-columns: repeat(auto-fill, minmax(${width}px, 1fr)); grid-row-gap: 24px; grid-column-gap: 24px`"
          >
            <DownloadCard
              v-for="download in downloads"
              :key="download.id"
              :download="download"
              :width="width"
            />
          </div>
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

  get marginSize() {
    return this.$vuetify.breakpoint.mobile ? 0.5 : 1
  }

  get width() {
    if (this.$vuetify.breakpoint.smAndDown) {
      return 100
    }

    if (this.$vuetify.breakpoint.lgAndDown) {
      return 150
    }

    return 195
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
