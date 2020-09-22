import { ActionTree, MutationTree } from 'vuex'

interface State {}

export const state = (): State => ({})

export const mutations: MutationTree<State> = {}

export const actions: ActionTree<any, any> = {
  async nuxtClientInit({ commit }) {
    const { data } = await this.$axios.get('/downloads')
    commit('downloads/setAll', data)
  },
}
