import axios from 'axios'
import Vue from 'vue'
import vuex from 'vuex'
import { createSocket } from '../../../frontend/plugins/socket'
import 'bulma-fluent/bulma.sass'
import vuetify from '../plugins/vuetify'
import * as downloads from '../../../frontend/store/downloads'
import App from './App.vue'

axios.defaults.baseURL = process.env.API_LOCATION

Vue.use(vuex)
const store = new vuex.Store({
  modules: {
    downloads,
  },
})

// eslint-disable-next-line
new Vue({
  el: '#app',
  async mounted() {
    const { data } = await axios.get(`${process.env.API_LOCATION}/downloads`)
    this.$store.commit('downloads/setAll', data)

    createSocket(this.$store)
  },
  render: (h) => h(App),
  vuetify,
  store,
})
