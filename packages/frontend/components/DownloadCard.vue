<template>
  <VueFlip
    :width="cardWidth.toString()"
    :height="(cardHeight + 5).toString()"
    :style="`width: ${cardWidth}px;`"
    active-click
  >
    <template v-slot:front>
      <v-card :height="cardHeight" :width="cardWidth">
        <v-img
          :src="download.poster"
          :width="cardWidth"
          :height="cardHeight"
        ></v-img>

        <v-progress-linear
          :indeterminate="indeterminate"
          :value="progress"
          :color="color"
          height="5"
        />
      </v-card>
    </template>
    <template v-slot:back>
      <v-card :height="cardHeight" :width="cardWidth">
        <div
          :style="`width: ${cardWidth}px; height: ${cardHeight}px`"
          class="pa-3"
        >
          <div class="movie-title">
            {{ download.title }}
          </div>
          <div class="movie-year">{{ download.year }}</div>
          <div class="movie-added-date">2 days ago</div>
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
</template>

<script lang="ts">
import { DownloadBundle } from '@fdl/types'
import { Component, Vue, Prop } from 'nuxt-property-decorator'
// @ts-ignore
import VueFlip from 'vue-flip'

@Component({
  components: {
    VueFlip,
  },
})
export default class InfoIndex extends Vue {
  @Prop({ type: Object, required: true })
  download!: DownloadBundle

  cardWidth = 150
  cardHeight = 230

  get color() {
    switch (this.download.step) {
      case 'complete':
        return 'green'
      case 'queue':
        return 'blue lighten-3'
      case 'extract':
        return 'orange'
      case 'download':
        return 'blue lighten-3'
    }

    return 'red'
  }

  get indeterminate() {
    return this.download.step === 'queue'
  }

  get progress() {
    switch (this.download.step) {
      case 'complete':
        return 100
      case 'extract':
        return this.download.extraction.progress
      case 'download':
        return this.download.downloadProgress
      default:
        return 0
    }
  }
}
</script>
