import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    file: { name: 'initial' },
    leftPaneWidth: 0
  },
  mutations: {
    changeFile (state, payload) {
      state.file = payload;
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
