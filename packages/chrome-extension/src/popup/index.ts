import Vue from 'vue'
import 'bulma-fluent/bulma.sass'
import vuetify from '../plugins/vuetify'
import App from './App.vue'

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: (h) => h(App),
  vuetify,
})
