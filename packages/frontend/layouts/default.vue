<template>
  <v-app id="inspire" color="#44494D">
    <v-navigation-drawer permanent app clipped floating color="#343A3F">
      <v-list-item>
        <v-list-item-content style="padding-bottom: 8px">
          <v-list-item-title class="title">
            <img height="25" src="/logo.png" />
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item link nuxt to="/">
          <v-list-item-action>
            <v-icon>mdi-download</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Downloads </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link nuxt :to="{name: 'info'}">
          <v-list-item-action>
            <v-icon>mdi-information</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Info </v-list-item-title>
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
.theme--dark.v-application {
  background: #44494d !important;
}
</style>
