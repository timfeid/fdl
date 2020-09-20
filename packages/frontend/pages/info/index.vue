<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>
        <v-icon>mdi-information</v-icon>
        Info
      </v-toolbar-title>
    </v-toolbar>
    <v-layout class="align-baseline ma-3">
      <v-container class="fill-height" fluid>
        <v-row>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="285.55"
              capacity="491.18"
              title="Download Path"
              color="orange darken-1"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="10244.53"
              capacity="15444.68"
              title="NAS"
              icon="mdi-server-network"
              color="green"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <DiskUsage
              used="20.7"
              capacity="31"
              title="RAM"
              icon="mdi-memory"
              color="blue"
            />
          </v-col>
          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="indigo" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
                    padding="24"
                    stroke-linecap="round"
                    smooth
                    fill
                    show-labels
                  >
                  </v-sparkline>
                </v-sheet>
              </v-card-text>

              <v-card-title class="pt-0">
                <v-icon large left>mdi-cpu-64-bit</v-icon>
                <div>CPU Usage</div>
                <div class="ml-auto font-weight-thin">1.2%</div>
              </v-card-title>
            </v-card>
          </v-col>

          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="purple" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
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
                <v-icon large left>mdi-speedometer</v-icon>
                <div>Download Speed</div>
                <div class="ml-auto font-weight-thin">110mb/s</div>
              </v-card-title>
            </v-card>
          </v-col>

          <v-col cols="2" class="py-0">
            <v-card class="mx-auto text-center" color="red" dark>
              <v-card-text>
                <v-sheet color="rgba(0, 0, 0, .12)">
                  <v-sparkline
                    :value="value"
                    :labels="labels"
                    color="rgba(255, 255, 255, .7)"
                    height="93"
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
                <v-icon large left>mdi-thermometer</v-icon>
                <div>CPU Temperature</div>
                <div class="ml-auto font-weight-thin">32ø</div>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <div class="mt-5" style="width: 100%">
          <v-card>
            <v-card-title>
              Nutrition
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="desserts"
              :search="search"
            ></v-data-table>
          </v-card>
        </div>
      </v-container>
    </v-layout>
  </div>
</template>
<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'

@Component
export default class InfoIndex extends Vue {
  value = [3.1, 4.2, 4.3, 3.1, 2.6, 1.1, 3.7, 4.1, 2.9, 3.2]

  labels = ['10s', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s', '1s']

  search = ''
  headers = [
    {
      text: 'Dessert (100g serving)',
      align: 'start',
      sortable: false,
      value: 'name',
    },
    { text: 'Calories', value: 'calories' },
    { text: 'Fat (g)', value: 'fat' },
    { text: 'Carbs (g)', value: 'carbs' },
    { text: 'Protein (g)', value: 'protein' },
    { text: 'Iron (%)', value: 'iron' },
  ]

  desserts = [
    {
      name: 'Frozen Yogurt',
      calories: 159,
      fat: 6.0,
      carbs: 24,
      protein: 4.0,
      iron: '1%',
    },
    {
      name: 'Ice cream sandwich',
      calories: 237,
      fat: 9.0,
      carbs: 37,
      protein: 4.3,
      iron: '1%',
    },
    {
      name: 'Eclair',
      calories: 262,
      fat: 16.0,
      carbs: 23,
      protein: 6.0,
      iron: '7%',
    },
    {
      name: 'Cupcake',
      calories: 305,
      fat: 3.7,
      carbs: 67,
      protein: 4.3,
      iron: '8%',
    },
    {
      name: 'Gingerbread',
      calories: 356,
      fat: 16.0,
      carbs: 49,
      protein: 3.9,
      iron: '16%',
    },
    {
      name: 'Jelly bean',
      calories: 375,
      fat: 0.0,
      carbs: 94,
      protein: 0.0,
      iron: '0%',
    },
    {
      name: 'Lollipop',
      calories: 392,
      fat: 0.2,
      carbs: 98,
      protein: 0,
      iron: '2%',
    },
    {
      name: 'Honeycomb',
      calories: 408,
      fat: 3.2,
      carbs: 87,
      protein: 6.5,
      iron: '45%',
    },
    {
      name: 'Donut',
      calories: 452,
      fat: 25.0,
      carbs: 51,
      protein: 4.9,
      iron: '22%',
    },
    {
      name: 'KitKat',
      calories: 518,
      fat: 26.0,
      carbs: 65,
      protein: 7,
      iron: '6%',
    },
    {
      name: 'KitKat',
      calories: 518,
      fat: 26.0,
      carbs: 65,
      protein: 7,
      iron: '6%',
    },
    {
      name: 'KitKat',
      calories: 518,
      fat: 26.0,
      carbs: 65,
      protein: 7,
      iron: '6%',
    },
  ]
}
</script>
