<template>
  <v-app id="inspire">
    <v-navigation-drawer permanent app clipped floating dark>
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

    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class App extends Vue {
  @Prop({ type: String })
  source!: string

  drawer: any = null
  items: any[] = []
  items2: any[] = []
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
</style>
