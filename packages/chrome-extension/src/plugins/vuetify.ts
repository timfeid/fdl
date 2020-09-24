import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VuetifyToast from 'vuetify-toast-snackbar'

Vue.use(Vuetify)
Vue.use(VuetifyToast)

const opts = {}

export default new Vuetify(opts)
