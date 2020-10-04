<template>
  <div class="app__main">
    <div id="nav">
      <v-sheet elevation="6">
        <v-tabs fixed-tabs background-color="#00bcd4" dark>
          <v-tab to="/">Now Showing</v-tab>
          <v-tab to="/library">Library</v-tab>
        </v-tabs>
      </v-sheet>
    </div>
    <div class="home">
      <resizable-pane class="layout">
        <template v-slot:resizable class="main">
          <router-view></router-view>
        </template>
        <template v-slot>
          <div class="sidebar" v-bind:class="{ 'now-playing': isHome }">
            <div class="video-preview" v-bind:class="{ 'video-full': isHome }"><VideoPreview /></div>
            <div class="playlist" v-bind:class="{ 'playlist-full': isHome }"><Playlist /></div>
          </div>
        </template>
      </resizable-pane>
    </div>
    <div class="trackbar"><Trackbar /></div>
  </div>
</template>
<style lang="scss">
.app__main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
  overflow: hidden;
}
.home {
  width: 100%;
  height: calc(100% - 48px - 75px);
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  color: white;
}
.layout {
  height: 100%;
}
.sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.now-playing {
  flex-direction: row;
  width: 100%;
}
.video-full {
  width: calc(100% - 24rem);
}
.playlist {
  font-family: "Fira Sans", sans-serif;
  height: 100%;
  background-color: #1e1e1e;
  color: #fff;
}
.playlist-full {
  width: 24rem;
}
.video-preview {
  font-family: "Fira Sans", sans-serif;
  min-width: 24rem;
  width: 100%; // calc(100% - 20rem);
  height: 100%;
  background-color: #1e1e1e;
  color: #fff;
  flex-basis: calc(100% - 24rem);
}
.trackbar {
  height: 75px;
  background-color: #1e1e1e;
  color: #fff;
  border-top: 1px solid #333;
  width: 100%;
  z-index: 99;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
#nav {
  background-color: #1e1e1e;
  height: 48px;
  width: 100%;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
<script>
// @ is an alias to /src
import VideoPreview from "@/components/VideoPreview.vue";
import Playlist from "@/components/Playlist.vue";
import Trackbar from "@/components/Trackbar.vue";
import ResizablePane from "@/views/helpers/ResizablePane.vue";

export default {
  name: "Home",
  components: {
    VideoPreview,
    Playlist,
    Trackbar,
    ResizablePane,
  },
  data() {
    return {
      isHome: true,
    };
  },
  methods: {},
  watch: {
    $route() {
      if (this.$route.path === "/") {
        this.isHome = true;
      } else {
        this.isHome = false;
      }
    },
  },
};
</script>
