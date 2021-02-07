import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    db: [],
    file: { name: 'initial' },
    playlist: [],
    isPaused: true,
    leftPaneWidth: 0,
    filter: '',
    currentFilterValue : 'All',
    categorization: '',
    sort: ''
  },
  mutations: {
    updateDB(state, payload) {
      state.db = payload;
    },
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
    },
    changeFilter (state, payload) {
      state.filter = payload;
    },
    changeCurrentFilterValue (state, payload) {
      state.currentFilterValue = payload;
    },
    changeCategorization (state, payload) {
      state.categorization = payload;
    },
    changeSortFilter (state, payload) {
      state.sort = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
