<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      floating
      dark
      :right="$vuetify.breakpoint.mobile"
    >
      <v-toolbar flat dark>
        <v-toolbar-title class="d-flex align-center">
          <img height="25" src="/logo.png" />
        </v-toolbar-title>
      </v-toolbar>

      <v-list dense>
        <v-list-item link nuxt to="/">
          <v-list-item-action>
            <v-icon>mdi-download</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Downloads </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link nuxt :to="{ name: 'info' }">
          <v-list-item-action>
            <v-icon>mdi-information</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Info </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link nuxt :to="{ name: 'add' }">
          <v-list-item-action>
            <v-icon>mdi-link-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Add Download </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar v-if="$vuetify.breakpoint.mobile" app dense flat dark>
      <v-toolbar-title class="d-flex align-center">
        <img height="25" src="/logo.png" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { DownloadBundle } from '@fdl/types'
import { Component, namespace, Vue, Watch } from 'nuxt-property-decorator'

const downloads = namespace('downloads')

@Component
export default class App extends Vue {
  @downloads.State recentlyCompleted!: null | DownloadBundle

  drawer: null | boolean = null

  @Watch('recentlyCompleted')
  emit() {
    this.$toast(`${this.recentlyCompleted.title} has finished downloading`, {
      color: 'blue darken-3',
      classes: ['v-sheet', 'v-sheet--outlined'],
      multiLine: true,
      icon: 'mdi-download-circle',
      timeout: 6000,
    })
  }
}
</script>

<style lang="scss">
.theme--light {
  &.v-application {
    background: #e4e5e6 !important;
  }
  .v-data-table {
    // background-color: #393D40;
  }
}
.v-toolbar__title {
  font-weight: 200;
}
</style>
