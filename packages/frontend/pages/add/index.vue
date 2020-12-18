<template>
  <div>
    <div v-if="loading" class="loader">
      <lottie-animation path="loading.json" />
    </div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-link-plus</v-icon>
        Add download
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height" fluid>
        <template v-if="error && error.error && error.error.details">
          <v-alert
            v-for="(detail, i) in error.error.details"
            :key="i"
            type="error"
            width="100%"
            class="mb-4"
          >
            <span v-text="detail.message"></span>
          </v-alert>
        </template>
        <v-stepper v-model="step" style="width: 100%" vertical>
          <v-stepper-step
            :complete="step > 1"
            step="1"
            style="cursor: pointer"
            @click="gotoStep(1)"
          >
            Referrer
            <small>Where did you find the links?</small>
          </v-stepper-step>

          <v-stepper-content step="1">
            <form @submit.prevent="lookUpLink">
              <v-text-field
                v-model="referrer"
                prepend-icon="mdi-link"
                label="Referrer"
                hint="Where did you get the download links?"
                required
              ></v-text-field>

              <div class="mt-3">
                <v-btn type="submit" color="info" :disabled="!referrer">
                  Continue <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </form>
          </v-stepper-content>

          <v-stepper-step
            :complete="step > 2"
            step="2"
            style="cursor: pointer"
            @click="gotoStep(2)"
          >
            Select a title
            <small v-text="stepTwoSummary"></small>
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-sheet color="white" class="border mb-4">
              <form @submit.prevent="performSearch">
                <div class="d-flex align-baseline">
                  <div style="flex: 1; margin-right: 1rem">
                    <v-text-field
                      v-model="search"
                      label="Name of series or movie"
                      required
                    ></v-text-field>
                  </div>
                  <div class="align-self-center">
                    <v-btn type="submit" color="info" icon
                      ><v-icon>mdi-magnify</v-icon>
                    </v-btn>
                  </div>
                </div>
              </form>
              <v-item-group
                v-if="step === 2"
                v-model="selected"
                mandatory
                class="d-flex flex-wrap"
                @change="getSeasonData"
              >
                <v-item
                  v-for="result in results"
                  v-slot:default="{ active, toggle }"
                  :key="result.id"
                  :value="result.id"
                >
                  <v-card width="300" class="mr-4 mb-4">
                    <v-img
                      :src="
                        result.backdrop ||
                        result.poster ||
                        'https://www.clipartmax.com/png/full/1-15852_exp-movie-icon.png'
                      "
                      width="300"
                      height="150"
                      :gradient="`to bottom left, rgba(${color(
                        active
                      )},.33), rgba(${color(active)},.9)`"
                      class="white--text full-height"
                      @click="toggle"
                    >
                      <div class="d-flex flex-column" style="height: 100%">
                        <v-btn icon dark>
                          <v-icon
                            v-text="
                              active
                                ? 'mdi-checkbox-marked-circle'
                                : 'mdi-checkbox-blank-circle'
                            "
                          ></v-icon>
                        </v-btn>
                        <v-card-title class="mt-auto">
                          <v-icon
                            class="white--text mr-4"
                            v-text="
                              result.type.name === 'series'
                                ? 'mdi-television'
                                : 'mdi-movie'
                            "
                          />
                          {{ result.title }} &nbsp;
                          <span
                            v-if="
                              result.type.name === 'movie' &&
                              result.firstAirDate
                            "
                            v-text="`(${result.firstAirDate})`"
                          />
                        </v-card-title>
                      </div>
                    </v-img>
                  </v-card>
                </v-item>
              </v-item-group>
              <v-item-group
                v-if="seriesInfo && step === 2"
                v-model="selectedSeason"
                mandatory
                class="d-flex flex-wrap mt-4"
                @change="getEpisodesData"
              >
                <v-item
                  v-for="season in seriesInfo.seasons"
                  v-slot:default="{ active, toggle }"
                  :key="season.id"
                  :value="season.id"
                >
                  <v-card width="300" class="mr-4 mb-4">
                    <v-img
                      :src="
                        season.poster_path
                          ? `https://image.tmdb.org/t/p/original${season.poster_path}`
                          : 'https://www.clipartmax.com/png/full/1-15852_exp-movie-icon.png'
                      "
                      width="300"
                      height="150"
                      :gradient="`to bottom left, rgba(${color(
                        active
                      )},.33), rgba(${color(active)},.9)`"
                      class="white--text full-height"
                      @click="toggle"
                    >
                      <div class="d-flex flex-column" style="height: 100%">
                        <v-btn icon dark>
                          <v-icon
                            v-text="
                              active
                                ? 'mdi-checkbox-marked-circle'
                                : 'mdi-checkbox-blank-circle'
                            "
                          ></v-icon>
                        </v-btn>
                        <v-card-title class="mt-auto">{{
                          season.name
                        }}</v-card-title>
                      </div>
                    </v-img>
                  </v-card>
                </v-item>
              </v-item-group>
              <v-item-group
                v-if="
                  seasonInfo &&
                  currentSelectionObj &&
                  currentSelectionObj.type.name === 'series'
                "
                v-model="selectedEpisode"
                class="d-flex flex-wrap mt-4"
              >
                <v-item
                  v-for="episode in seasonInfo.episodes"
                  v-slot:default="{ active, toggle }"
                  :key="episode.id"
                  :value="episode.id"
                >
                  <v-card width="300" height="150" class="mr-4 mb-4" dark>
                    <v-img
                      src="https://www.netclipart.com/pp/m/173-1730960_television-icon-png-icon-television.png"
                      width="300"
                      height="150"
                      :gradient="`to bottom left, rgba(${color(
                        active
                      )},.33), rgba(${color(active)},.9)`"
                      class="white--text full-height"
                      @click="toggle"
                    >
                      <div class="d-flex flex-column" style="height: 100%">
                        <v-btn icon dark>
                          <v-icon
                            v-text="
                              active
                                ? 'mdi-checkbox-marked-circle'
                                : 'mdi-checkbox-blank-circle'
                            "
                          ></v-icon>
                        </v-btn>
                        <v-card-title class="mt-auto"
                          >Episode {{ episode.episode_number }}</v-card-title
                        >
                      </div>
                    </v-img>
                  </v-card>
                </v-item>
              </v-item-group>
            </v-sheet>
            <v-btn
              color="primary"
              :disabled="!currentSelectionObj"
              @click="currentSelectionObj ? gotoStep(3) : null"
              >Continue</v-btn
            >
            <!-- <v-btn text>Cancel</v-btn> -->
          </v-stepper-content>

          <v-stepper-step
            :complete="step > 3"
            step="3"
            style="cursor: pointer"
            @click="gotoStep(3)"
            >Download links</v-stepper-step
          >

          <v-stepper-content step="3">
            <v-sheet>
              <form @submit.prevent="checkStep3">
                <v-textarea
                  v-model="rawUrls"
                  prepend-icon="mdi-download-multiple"
                  label="Urls"
                  rows="3"
                  required
                ></v-textarea>
                <v-btn
                  type="submit"
                  :disabled="!referrer || !urls"
                  color="primary"
                  >Continue</v-btn
                >
              </form>
            </v-sheet>
          </v-stepper-content>

          <v-stepper-step step="4" style="cursor: pointer" @click="gotoStep(4)"
            >Review information</v-stepper-step
          >

          <v-stepper-content step="4">
            <v-card v-if="downloadInfo" width="300" class="mr-4 mb-4">
              <v-img
                :src="downloadInfo.poster"
                width="300"
                height="150"
                :gradient="`to bottom left, rgba(0,0,0,.33), rgba(0,0,0,.9)`"
                class="white--text full-height"
              >
                <v-card-title>{{ downloadInfo.title }}</v-card-title>
                <v-card-subtitle
                  v-if="downloadInfo.season !== undefined"
                  class="white--text"
                  >Season {{ downloadInfo.season }}
                  <span v-if="downloadInfo.episode !== undefined"
                    >Episode {{ downloadInfo.episode }}</span
                  ></v-card-subtitle
                >
              </v-img>
              <v-card-text>
                {{ downloadInfo.blurb }}
              </v-card-text>
            </v-card>
            <v-btn color="success" @click="download">Download</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-container>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
// @ts-ignore
import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue'

@Component({
  components: {
    LottieAnimation,
  },
})
export default class AddIndex extends Vue {
  loading = false
  referrer = ''

  rawUrls = ''

  search = ''

  error: any = {}

  selected = 0

  selectedSeason = 0

  selectedEpisode = 0

  results: any[] = []

  seriesInfo: Record<string, any> | null = null

  seasonInfo: Record<string, any> | null = null

  step = 1

  gotoStep(step: number) {
    if (step === 2 && !this.referrer) {
      return
    }
    if (step === 3) {
      if (this.currentSelectionObj) {
        this.step = 3
      }
      return
    }
    if (step === 4) {
      return this.checkStep3()
    }
    this.step = step
  }

  async getSeasonData() {
    this.loading = true
    this.seriesInfo = null
    if (
      this.currentSelectionObj &&
      this.currentSelectionObj.type.name === 'series' &&
      this.selected
    ) {
      const results = await this.$axios(`/info/series/${this.selected}/raw`)
      this.seriesInfo = results.data
    }
  }

  async getEpisodesData() {
    this.seasonInfo = null
    if (this.selectedSeasonObj) {
      const results = await this.$axios(
        `/info/series/${this.selected}/${this.selectedSeasonObj.season_number}`
      )

      this.seasonInfo = results.data
    }
  }

  async performSearch() {
    const results = await this.$axios('/info/search', {
      params: { query: this.search },
    })

    this.results = results.data
  }

  checkStep3() {
    if (this.urls.length > 0 && !!this.referrer) {
      this.step = 4
    }
  }

  async lookUpLink() {
    this.loading = true
    try {
      const result = await this.$axios('/info/from-link', {
        params: { url: this.referrer },
      })
      this.search = result.data.title

      await this.performSearch()
      this.selected = this.results[0].id
      if (result.data.season) {
        // this.selectedSeason = result.data.season
        await this.getSeasonData()

        const season = this.seriesInfo.seasons.find(
          (s: any) => s.season_number === result.data.season
        )
        if (season) {
          this.selectedSeason = season.id
        }

        await this.getEpisodesData()

        if (result.data.episode) {
          const episode = this.seasonInfo.episodes.find(
            (s: any) => s.episode_number === result.data.episode
          )
          if (episode) {
            this.selectedEpisode = episode.id
          }
        }
      }

      this.rawUrls = result.data.urls.join('\n')
      this.referrer = result.data.url
      this.gotoStep(4)
    } catch (e) {
      console.log(e)
      console.log('unable to look that up')
      this.gotoStep(2)
    }

    this.loading = false
  }

  color(active: boolean) {
    return active ? '0,55,75' : '0,0,0'
  }

  get selectedEpisodeObj() {
    if (!this.seasonInfo) {
      return
    }
    return this.seasonInfo.episodes.find(
      (result: any) => result.id === this.selectedEpisode
    )
  }

  get selectedSeasonObj() {
    if (!this.seriesInfo) {
      return
    }
    console.log(this.seriesInfo)
    return this.seriesInfo.seasons.find(
      (result: any) => result.id === this.selectedSeason
    )
  }

  get currentSelectionObj() {
    return this.results.find((result) => result.id === this.selected)
  }

  get stepTwoSummary() {
    if (this.currentSelectionObj) {
      let result = this.currentSelectionObj.title

      if (this.selectedSeasonObj) {
        result += ` S${this.selectedSeasonObj.season_number
          .toString()
          .padStart(2, '0')}`
      }

      if (this.selectedEpisodeObj) {
        result += `E${this.selectedEpisodeObj.episode_number
          .toString()
          .padStart(2, '0')}`
      }

      return result
    }
    return 'We need some metadata'
  }

  get urls() {
    return this.rawUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => !!url)
  }

  get year() {
    if (this.currentSelectionObj) {
      if (this.selectedEpisodeObj) {
        return this.selectedEpisodeObj.air_date || this.selectedEpisodeObj.year
      }
      if (this.selectedSeasonObj) {
        return this.selectedSeasonObj.air_date || this.selectedSeasonObj.year
      }
      return (
        this.currentSelectionObj.firstAirDate || this.currentSelectionObj.year
      )
    }

    return ''
  }

  get downloadInfo() {
    if (this.currentSelectionObj) {
      return {
        urls: this.urls,
        referrer: this.referrer,
        type: this.currentSelectionObj.type.name,
        title: this.currentSelectionObj.title,
        year: this.year,
        blurb: this.selectedEpisodeObj
          ? this.selectedEpisodeObj.overview
          : this.currentSelectionObj.blurb,
        poster: this.currentSelectionObj.poster,
        backdrop: this.currentSelectionObj.backdrop,
        season: this.selectedSeasonObj
          ? this.selectedSeasonObj.season_number
          : undefined,
        episode: this.selectedEpisodeObj
          ? this.selectedEpisodeObj.episode_number
          : undefined,
      }
    }
  }

  async download() {
    this.error = {}
    try {
      await this.$axios.post('/downloads', this.downloadInfo)
      this.$toasted.show(`${this.downloadInfo.title} started downloading`, {
        type: 'info',
        icon: 'progress-download',
        duration: 6000,
      })
      this.referrer = ''
      this.rawUrls = ''
      this.selectedSeason = 0
      this.selectedEpisode = 0
      this.selected = 0
      this.step = 0
      this.$router.replace('/')
    } catch (e) {
      console.log(e)
      this.error = e.response.data
    }
  }
}
</script>

<style lang="scss">
.loader {
  z-index: 10000;
  background: rgba(255, 255, 255, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-content: center;
  justify-content: center;
  div {
    max-width: 150px;
  }
}
</style>
