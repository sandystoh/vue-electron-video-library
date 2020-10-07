<template>
  <div style="width: 100%; height: 100%">
    <v-toolbar dark dense shaped elevation="0" class="playlist__search">
      <v-btn icon>
        <v-icon>mdi-playlist-music</v-icon>
      </v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }"
          ><div v-on="on" class="playlist__title">
            {{ playlistName }}
          </div></template>
        <span>{{ playlistName }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-card dark class="mx-auto playlist__listing" max-width="100%">
      <v-list shaped dark>
        <v-list-item
          v-for="f in playlist"
          @click="openVideo(f)"
          v-bind:id="f.id"
          v-bind:key="f.id"
          two-line
          link
          v-bind:class="{ playlist__highlight: f.id === activeFile.id }"
        >
          <v-list-item-avatar>
            <v-icon>fas fa-film</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ f.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ f.size }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <!-- <v-btn icon>
              <v-icon color="grey lighten-1"> mdi-playlist-minus</v-icon>
            </v-btn> -->
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
    <!-- <img src="local-resource://D://test.png"/> -->
  </div>
</template>
<style lang="scss">
.playlist {
  &__search {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
  }
  &__title {
    width: 300px;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    text-overflow: ellipsis;
  }
  &__highlight {
    background-color: #333;
  }
  &__listing {
    width: 100%;
    height: calc(100% - 48px);
    overflow: hidden;
    overflow-y: scroll;
    .v-list {
      max-height: 100vh;
    }
    /* total width */
    &::-webkit-scrollbar {
      background-color: #1e1e1e;
      width: 16px;
    }

    /* background of the scrollbar except button or resizer */
    &::-webkit-scrollbar-track {
      background-color: #1e1e1e;
    }

    /* scrollbar itself */
    &::-webkit-scrollbar-thumb {
      background-color: #babac0;
      border-radius: 16px;
      border: 4px solid #1e1e1e;
    }

    /* set button(top and bottom of the scrollbar) */
    &::-webkit-scrollbar-button {
      display: none;
    }
  }
}
</style>
<script>
export default {
  name: "Playlist",

  data: () => ({
    playlistName: "",
    activeFile: null,
    playlist: [],
  }),
  mounted() {},
  methods: {
    loadImage(path) {
      const image1 = document.getElementById("image-1");
      image1.src = `appName-safe-file-protocol://${path}`;
    },
    openVideo(file) {
      this.$store.commit("changeFile", file);
    },
  },
  computed: {
    videoChange() {
      return this.$store.state.file;
    },
    playlistChange() {
      return this.$store.state.playlist;
    },
  },
  watch: {
    videoChange(newVideo) {
      this.activeFile = newVideo;
      setTimeout(() => {
        document.getElementById(newVideo.id).scrollIntoView({
          behavior: "smooth",
        });
      }, 200);
    },
    playlistChange(newPlaylist) {
      this.playlistName = newPlaylist.name;
      this.playlist = newPlaylist.playlist;
    },
  },
};
</script>
