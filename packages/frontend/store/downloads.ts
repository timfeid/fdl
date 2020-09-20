import { ActionTree, MutationTree } from 'vuex'
import { DownloadBundle } from '@fdl/types'
import vue from 'vue'

interface State {
  downloads: DownloadBundle[]
}

export const state = (): State => ({
  downloads: [],
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

  setAll(state, downloads: DownloadBundle[]) {
    state.downloads = downloads
  },
}

export const actions: ActionTree<State, any> = {}
