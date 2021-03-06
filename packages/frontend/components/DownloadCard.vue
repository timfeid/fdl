<template>
  <div>
    <VueFlip
      :width="width.toString()"
      :height="(height + 5).toString()"
      :style="`width: ${width}px;height: ${(height + 5).toString()}px`"
      active-click
      @click.native="showInfoInConsole"
    >
      <template v-slot:front>
        <v-card :height="height" :width="width">
          <v-img :src="download.poster" :width="width" :height="height"></v-img>

          <v-progress-linear
            :indeterminate="indeterminate"
            :value="progress"
            :color="color"
            height="5"
          />
        </v-card>
      </template>
      <template v-slot:back>
        <v-card :height="height" :width="width">
          <div :style="`width: ${width}px; height: ${height}px`" class="pa-3">
            <div class="movie-title">
              {{ download.title }}
            </div>
            <div class="movie-year">{{ download.year }}</div>
            <div class="movie-added-date">{{ timeago }}</div>
            <div v-if="download.downloads" class="mt-3">
              <div
                v-for="(dl, i) in download.downloads"
                :key="i"
                style="height: 10px"
              >
                <v-progress-linear
                  :value="dl.totalProgress"
                  color="blue lighten-3"
                  height="5"
                />
              </div>
            </div>
          </div>

          <v-progress-linear
            :indeterminate="indeterminate"
            :value="progress"
            :color="color"
            height="5"
          />
        </v-card>
      </template>
    </VueFlip>
    <div
      class="download-title"
      :style="`width: ${width}px`"
      v-text="download.title"
    />
    <div
      class="download-subtitle"
      :style="`width: ${width}px`"
      v-text="subtitle"
    />
  </div>
</template>

<script lang="ts">
import { DownloadBundle, Step } from '@fdl/types'
import { Component, Vue, Prop } from 'nuxt-property-decorator'
// @ts-ignore
import VueFlip from 'vue-flip'
import moment from 'moment'

@Component({
  components: {
    VueFlip,
  },
})
export default class InfoIndex extends Vue {
  @Prop({ type: Object, required: true })
  download!: DownloadBundle

  @Prop({ type: Number, required: false, default: 150 })
  width!: number

  get subtitle() {
    let str = ''
    if (this.download.type.name === 'series') {
      str +=
        (this.$vuetify.breakpoint.mobile ? 'S' : 'Season ') +
        this.download.season.toString().padStart(2, '0')
      if (this.download.episode) {
        str +=
          (this.$vuetify.breakpoint.mobile ? 'E' : ', Episode ') +
          this.download.episode.toString().padStart(2, '0')
      }
    }

    return str || this.download.year
  }

  get height() {
    return this.width * 1.53
  }

  get timeago() {
    return moment((this.download as any).createdAt).fromNow()
  }

  get color() {
    switch (this.download.step) {
      case Step.COMPLETE:
        return 'green'
      case Step.QUEUE:
        return 'blue lighten-3'
      case Step.EXTRACT:
        return 'orange'
      case Step.DOWNLOAD:
        return 'blue lighten-3'
    }

    return 'red'
  }

  get indeterminate() {
    return this.download.step === 'queue'
  }

  get progress() {
    switch (this.download.step) {
      case Step.COMPLETE:
        return 100
      case Step.EXTRACT:
        return this.download.extraction ? this.download.extraction.progress : 0
      case Step.DOWNLOAD:
        return this.download.downloadProgress
      default:
        return 0
    }
  }

  showInfoInConsole() {
    console.log(this.download)
  }
}
</script>

<style lang="scss">
.download {
  &-title,
  &-subtitle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-title {
    color: #436565;
    margin-top: 0.5rem;
    line-height: 1.2rem;
    font-size: 1rem;
  }
  &-subtitle {
    font-weight: 300;
    color: lighten(#436565, 5%);
  }
}
</style>
