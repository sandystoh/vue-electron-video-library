<template>
  <div style="width:100%; height:100%">
    <v-toolbar
      dense
      shaped
      elevation="0"
      class="sidebar__search"
    >
      <v-btn icon @click="openFolder()">
        <v-icon>mdi-folder-open-outline</v-icon>
      </v-btn>
      <v-text-field hide-details single-line></v-text-field>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card dark class="mx-auto sidebar__listing" max-width="100%">
      <v-list shaped dark>
        <v-subheader @click="openFolder()"
          ><span class="cursor-pointer">{{ dir }}</span></v-subheader
        >
        <v-list-item
          v-for="f in files"
          @click="openVideo(f)"
          v-bind:key="f.id"
          two-line
          link
        >
          <v-list-item-avatar>
            <v-icon>fas fa-film</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ f.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ f.size }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey lighten-1"> mdi-playlist-plus</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
    <!-- <img src="local-resource://D://test.png"/> -->
  </div>
</template>
<style lang="scss">
.sidebar {
  &__search {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
  }
  &__listing {
    width: 100%;
    height: calc(100vh - 48px - 75px - 45px);
    overflow-y: scroll;
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
import { ipcRenderer } from "electron";
export default {
  name: "Playlist",

  data: () => ({
    dir: "C:/test",
    files: [],
    file: "",
  }),
  mounted() {
    ipcRenderer.on("open-folder-dialog-reply", (event, data) => {
      this.dir = data.dir;
      this.files = data.files;
      // console.log(this.files);
    });
  },
  methods: {
    openFolder() {
      ipcRenderer.send("selectDirectory");
    },
    loadImage(path) {
      const image1 = document.getElementById("image-1");
      image1.src = `appName-safe-file-protocol://${path}`;
    },
    openVideo(file) {
      // console.log('sidebar', file);
      this.$store.commit('changeFile', file);
      // console.log('sidebar', this.$store.state.file.name);
    }
  },
};
</script>
