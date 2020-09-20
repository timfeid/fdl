<template>
  <v-card :color="color" dark>
    <v-card-text>
      <v-sheet color="rgba(0, 0, 0, .12)" height="139">
        <v-progress-linear
          :value="percentage"
          :color="`${color} darken-2`"
          height="139"
          striped
        />
      </v-sheet>
    </v-card-text>
    <!-- <v-card-text class="text-center">
      <span class="display-1 font-weight-thin">{{ remaining }} GB</span>
      <v-card-subtitle class="py-0 font-weight-thin">available</v-card-subtitle>
    </v-card-text>
    <v-divider></v-divider> -->


    <v-card-title class="pt-0">
      <v-icon large left>{{ icon }}</v-icon>
      <div>{{ title }}</div>
      <div class="ml-auto font-weight-thin">{{ remaining }} GB</div>
    </v-card-title>

    <!-- <v-divider></v-divider> -->

    <!-- <v-list-item>
      <v-list-item-subtitle>{{ remaining }} GB</v-list-item-subtitle>
    </v-list-item> -->
  </v-card>
</template>

<script lang="ts">
import { Component, namespace, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class InfoIndex extends Vue {
  @Prop({ type: [Number, String], required: true })
  used!: number

  @Prop({ type: [Number, String], required: true })
  capacity!: number

  @Prop({ type: String, required: true })
  title!: string

  @Prop({ type: String, default: 'mdi-harddisk' })
  icon!: string

  @Prop({ type: String, default: 'blue' })
  color!: string

  get percentage () {
    return (Number(this.used) / Number(this.capacity || 1)) * 100
  }

  get remaining () {
    return Number(this.capacity) - Number(this.used)
  }
}
</script>
