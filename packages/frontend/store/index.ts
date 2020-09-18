import { ActionTree, MutationTree } from 'vuex'

interface State {}

export const state = (): State => ({})

export const mutations: MutationTree<State> = {}

export const actions: ActionTree<any, any> = {
  async nuxtClientInit({ commit }) {
    console.log('hello world')
    const { data } = await this.$axios.get('/downloads')
    console.log(data)
    commit('downloads/setAll', data)
  },
}
