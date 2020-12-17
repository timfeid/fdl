<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-view-list</v-icon>
        Browse catalog
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height" fluid>
        <v-row class="filters">
          <v-col cols="4" class="pt-0">
            <v-combobox
              v-model="filter.qualities"
              :items="qualities"
              label="Filter by quality"
              multiple
              chips
              outlined
              small-chips
              @change="resetPage"
            ></v-combobox>
          </v-col>
          <v-col cols="4" class="pt-0">
            <v-combobox
              v-model="filter.years"
              :items="years"
              label="Filter by year"
              multiple
              chips
              outlined
              small-chips
              @change="resetPage"
            ></v-combobox>
          </v-col>
          <v-col cols="4" class="pt-0">
            <v-combobox
              v-model="filter.tags"
              :items="filterableTags"
              label="Filter by tag"
              multiple
              chips
              outlined
              small-chips
              @change="resetPage"
            ></v-combobox>
          </v-col>
        </v-row>
        <div style="display: block; width: 100%">
          <div
            :style="`display: grid; grid-template-columns: repeat(auto-fill, minmax(${width}px, 1fr)); grid-row-gap: 24px; grid-column-gap: ${gap}px`"
          >
            <entity
              v-for="entity in entities"
              :key="`entity-${entity.id}`"
              :entity="entity"
            />
          </div>
        </div>
        <div v-intersect="increasePage" />
        <!-- <pre>{{ entities }}</pre> -->
      </v-container>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'
import debounce from 'debounce'

@Component({})
export default class AddIndex extends Vue {
  entities: any[] = []
  tags: any[] = []
  filter = {
    years: [] as any[],
    qualities: [] as any[],
    tags: [] as any[],
  }

  page = 1
  hasMore = true

  async mounted() {
    this.resetPage()
    this.tags = (await this.$axios.get('tags')).data
  }

  get width() {
    // if (this.$vuetify.breakpoint.xs) {
    //   return 90
    // }

    // if (this.$vuetify.breakpoint.mdAndDown) {
    //   return 125
    // }

    // if (this.$vuetify.breakpoint.lgAndDown) {
    //   return 250
    // }

    return 320
  }

  get gap() {
    // if (this.$vuetify.breakpoint.smAndDown) {
    //   return 5
    // }

    return 24
  }

  get filterableTags() {
    return this.tags.filter((tag) => tag.category === 'other')
  }

  get qualities() {
    return this.tags
      .filter((tag) => tag.category === 'quality')
      .sort((a, b) => (parseInt(a.text, 10) > parseInt(b.text, 10) ? -1 : 1))
  }

  get years() {
    return this.tags
      .filter((tag) => tag.category === 'year')
      .sort((a, b) => (a > b ? 1 : -1))
  }

  get params() {
    return {
      page: this.page,
      tagIds: this.filter.tags.map((tag) => tag.id),
      yearTagIds: this.filter.years.map((tag) => tag.id),
      qualityTagIds: this.filter.qualities.map((tag) => tag.id),
    }
  }

  increasePage = debounce(this.pageIncrease, 1000)

  pageIncrease() {
    this.page++
    this.getEntities()
  }

  resetPage() {
    this.increasePage.clear()
    this.entities = []
    this.hasMore = true
    this.page = 1
    this.getEntities()
  }

  async getEntities() {
    if (this.hasMore) {
      const data = (
        await this.$axios.get('entities', {
          params: this.params,
        })
      ).data
      this.hasMore = data.length > 0

      this.entities = [...this.entities, ...data]
    }
  }
}
</script>

<style lang="scss">
.filters {
  .v-text-field__details {
    display: none;
  }
}
</style>
