<template>
  <div class="full-height">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-view-list</v-icon>
        Browse catalog
      </v-toolbar-title>
    </v-toolbar>

    <div
      class="d-flex"
      :class="{ 'flex-column': $vuetify.breakpoint.mdAndDown }"
    >
      <component
        :is="$vuetify.breakpoint.lgAndUp ? 'v-navigation-drawer' : 'div'"
        class="filter-nav-bar"
        fixed
        floating
        clipped
        style="left: 256px; top: 0"
        color="transparent"
        width="320"
      >
        <div class="filters">
          <div class="filters-header" />
          <div class="filters-content">
            <!-- <h3>Filters</h3> -->
            <v-text-field
              v-model="search"
              label="Search"
              prepend-icon="mdi-magnify"
              @input="delayedSearch"
            ></v-text-field>
            <v-combobox
              v-model="filter.qualities"
              :items="qualities"
              prepend-icon="mdi-equalizer"
              label="Filter by quality"
              multiple
              chips
              small-chips
              @change="resetPage"
            ></v-combobox>
            <v-combobox
              v-model="filter.years"
              :items="years"
              label="Filter by year"
              multiple
              chips
              prepend-icon="mdi-calendar-today"
              small-chips
              @change="resetPage"
            ></v-combobox>
            <v-combobox
              v-model="filter.tags"
              :items="filterableTags"
              label="Filter by tag"
              multiple
              chips
              prepend-icon="mdi-label"
              small-chips
              @change="resetPage"
            ></v-combobox>
          </div>
        </div>
      </component>
      <div class="browse-items" :style="`margin: ${gap}px`">
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

      <!-- <pre>{{ entities }}</pre> -->
    </div>
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
  search = ''

  async mounted() {
    this.resetPage()
    window.addEventListener('scroll', this.infiniteScroll)
    this.tags = (await this.$axios.get('tags')).data
  }

  infiniteScroll() {
    const scrollY = window.scrollY
    const visible = document.documentElement.clientHeight
    const pageHeight = document.documentElement.scrollHeight
    const bottomOfPage = visible + scrollY >= pageHeight
    if (bottomOfPage || pageHeight < visible) {
      this.increasePage()
    }
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
      search: this.search,
      page: this.page,
      tagIds: this.filter.tags.map((tag) => tag.id),
      yearTagIds: this.filter.years.map((tag) => tag.id),
      qualityTagIds: this.filter.qualities.map((tag) => tag.id),
    }
  }

  increasePage = debounce(this.pageIncrease, 750)

  delayedSearch = debounce(this.resetPage, 500)

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
      this.hasMore = data.length === 15

      this.entities = [...this.entities, ...data]
    }
  }
}
</script>

<style lang="scss">
@import '~vuetify/src/styles/settings/_variables';
.filters {
  @media #{map-get($display-breakpoints, 'md-and-down')} {
    width: 100% !important;
    display: flex;
  }
  .v-text-field__details {
    display: none;
  }
  &-header {
    height: 64px;
  }
  &-content {
    padding: 1rem;
    width: 100%;
  }
  // position: fixed;
  // right: 0;
  // top: 0;
  // width: 320px;
  // background: white;
}

.browse-items {
  @media #{map-get($display-breakpoints, 'lg-and-up')} {
    width: calc(100% - 320px);
    margin-left: 344px !important;
  }
}

.filter-nav-bar {
  align-self: flex-start;
  height: 100%;
  z-index: 1;
  @media #{map-get($display-breakpoints, 'md-and-down')} {
    width: 100% !important;
    align-self: stretch;
  }
}
</style>
