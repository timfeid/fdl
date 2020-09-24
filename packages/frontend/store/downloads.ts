import { ActionTree, MutationTree } from 'vuex'
import { DownloadBundle, Step, SystemInformation } from '@fdl/types'
import vue from 'vue'

interface State {
  downloads: DownloadBundle[]
  info: SystemInformation | null
  recentlyCompleted: DownloadBundle | null
}

export const state = (): State => ({
  downloads: [],
  info: null,
  recentlyCompleted: null,
})

export const mutations: MutationTree<State> = {
  add(state, download: DownloadBundle) {
    state.downloads.unshift(download)
  },

  update(state, download: DownloadBundle) {
    const index = state.downloads.findIndex((d) => d.id === download.id)
    if (index !== -1) {
      vue.set(state.downloads, index, download)
    } else {
      state.downloads.unshift(download)
    }
  },

  recentlyCompleted(state, download: DownloadBundle) {
    console.log('changed it')
    state.recentlyCompleted = download
  },

  info(state, info: SystemInformation) {
    state.info = info
  },

  setAll(state, downloads: DownloadBundle[]) {
    state.downloads = downloads
  },
}

export const actions: ActionTree<State, any> = {
  update({ commit }, download: DownloadBundle) {
    console.log(download.step)
    if (download.step === Step.COMPLETE) {
      commit('recentlyCompleted', download)
    }
    commit('update', download)
  },
}

export const namespaced = true
