<template>
  <v-card>
    <v-img
      height="250"
      :src="entity.backdrop || entity.poster"
      :gradient="`to top left, rgba(0,0,0,.33), rgba(0,0,0,.9)`"
    >
      <div
        class="pa-3 d-flex"
        style="height: 100%; align-items: top; flex-direction: column"
      >
        <div>
          <v-icon v-if="has4k(entity)" color="white">mdi-video-4k-box</v-icon>
          <v-icon v-if="hasHd(entity)" color="white"
            >mdi-video-high-definition</v-icon
          >
          <span
            v-if="has4k(entity)"
            style="color: white; font-size: 12px; font-weight: bold"
            v-text="'2160'"
          />
          <span
            v-if="hasHd(entity)"
            style="color: white; font-size: 12px; font-weight: bold"
            v-text="hdText(entity)"
          />
        </div>
        <div
          class="mt-auto"
          style="color: white; font-size: 24px"
          v-text="title(entity)"
        />
      </div>
    </v-img>

    <v-card-text style="height: 192px; overflow: hidden">
      <div class="my-4 subtitle-1">
        {{ capitalize(entity.type.name) }}
      </div>

      <v-row v-if="entity.ratingAverage" align="center" class="mx-0">
        <v-rating
          :value="entity.ratingAverage"
          dense
          size="14"
          :length="10"
          half-increments
          half-icon="mdi-star-half-full"
          readonly
        ></v-rating>

        <div class="grey--text ml-4">
          {{ entity.ratingAverage }} ({{ votes(entity.ratingVotes) }})
        </div>
      </v-row>

      <div v-text="entity.blurb" />
    </v-card-text>

    <v-divider class="mx-4"></v-divider>

    <v-card-title>Tags</v-card-title>

    <v-card-text style="height: 96px; overflow: hidden">
      <v-chip
        v-for="tag of entity.tags"
        :key="`tag-${tag.id}`"
        class="mr-2 mb-2"
        v-text="tag.text"
      />
    </v-card-text>

    <v-card-actions>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" text v-bind="attrs" v-on="on">
            Download
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in entity.downloadables"
            :key="index"
            link
            @click="download(entity, item)"
          >
            <v-list-item-title>{{ item.quality }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip v-if="entity.trailer" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ml-auto"
            icon
            color="#d2d2d2"
            link
            small
            :href="entity.trailer"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-video-vintage</v-icon>
          </v-btn>
        </template>
        <span>Trailer</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import moment from 'moment'

@Component
export default class EntityComponent extends Vue {
  @Prop({ type: Object, required: true })
  entity!: any

  votes(total: number) {
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  capitalize(text: string) {
    return text.substring(0, 1).toUpperCase() + text.substring(1)
  }

  has4k(entity: any) {
    return !!entity.downloadables.find(
      (downloadable: any) => downloadable.quality === '2160p'
    )
  }

  hasHd(entity: any) {
    return !!entity.downloadables.find((downloadable: any) =>
      ['720p', '1080p'].includes(downloadable.quality)
    )
  }

  hdText(entity: any) {
    return entity.downloadables.find(
      (downloadable: any) => downloadable.quality === '1080p'
    )
      ? '1080'
      : '720'
  }

  title(entity: any) {
    let title = entity.title

    if (entity.type.name === 'series') {
      title += ` S${(entity.season || '').toString().padStart(2, '0')}`
      if (entity.episode) {
        title += `E${(entity.episode || '').toString().padStart(2, '0')}`
      }
    }

    return title
  }

  async download(entity: any, downloadable: any) {
    const download = {
      ...downloadable,
      ...entity,
      urls: downloadable.urls.map((url: any) => url.url),
      type: entity.type.name,
    }

    await this.$axios.post('/downloads', download)
    this.$toasted.show(`${download.title} started downloading`, {
      type: 'info',
      icon: 'progress-download',
      duration: 6000,
    })
    // this.$router.replace('/')
  }
}
</script>
