import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    file: { name: 'initial' },
    playlist: [],
    isPaused: true,
    leftPaneWidth: 0
  },
  mutations: {
    changeFile (state, payload) {
      state.file = payload;
    },
    changePausedStatus (state, payload) {
      state.isPaused = payload;
    },
    changePlaylist (state, payload) {
      state.playlist = payload;
    },
    changeLeftPanelWidth (state, payload) {
      state.leftPaneWidth = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
