import Vue from 'vue'
import Toasted from 'vue-toasted'

Vue.use(Toasted, {
  iconPack: 'mdi',
  keepOnHover: true,
  className: 'toast',
  theme: 'outline',
})
