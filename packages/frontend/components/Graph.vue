<template>
  <v-card class="mx-auto text-center" :color="color" dark>
    <v-card-text>
      <v-sheet color="rgba(0, 0, 0, .12)" height="139">
        <v-sparkline
          :value="values"
          :labels="labels"
          color="rgba(255, 255, 255, .7)"
          padding="24"
          stroke-linecap="round"
          smooth
          fill
          show-labels
        >
        </v-sparkline>
      </v-sheet>
    </v-card-text>

    <v-card-title style="padding-top: 1px !important">
      <v-icon large left>{{ icon }}</v-icon>
      <div>{{ title }}</div>
      <div class="ml-auto font-weight-thin">
        {{ valueProperty(currentValue) }}{{ unit }}
      </div>
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
import { SystemInformation } from '@fdl/types'
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class Graph extends Vue {
  @Prop({ type: String, required: true })
  color: string

  @Prop({ type: Array, required: true })
  value: SystemInformation[]

  @Prop({ type: String, required: true })
  title: string

  @Prop({ type: String, required: true })
  icon: string

  @Prop({ type: String, required: true })
  unit: string

  @Prop({ type: Function, required: true })
  valueProperty: (infos: SystemInformation) => any

  get values() {
    return this.value.map((info) => this.valueProperty(info))
  }

  get labels() {
    return [...Array(this.value.length + 1)].map(
      (_, i) => `${(this.value.length - i) * 5}s`
    )
  }

  get currentValue() {
    return this.value[this.value.length - 1]
  }
}
</script>
