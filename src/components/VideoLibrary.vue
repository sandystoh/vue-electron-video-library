<template>
  <div class="videolibrary">
    <v-toolbar dark dense>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            dark
            class="ma-2"
            :loading="isImporting"
            color="#555"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-folder-open-outline</v-icon
            ><span style="padding-left: 0.5rem">Import</span>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline"
              >Import Video Folder or Files to Library</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="4">
                  <v-btn dark class="ma-2" color="#555" @click="getDir()">
                    <v-icon>mdi-folder-open-outline</v-icon
                    ><span>Choose Folder</span>
                  </v-btn> </v-col
                ><v-col cols="3"></v-col>
                <v-col cols="4">
                  <v-btn dark class="ma-2" color="#555" @click="getFilePaths()">
                    <v-icon>mdi-file-video-outline</v-icon
                    ><span>Choose Files</span>
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  {{ importdir }}
                  <li v-for="f in importfilepaths" v-bind:key="f">
                    {{ f }}
                  </li>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="importartist"
                    :items="artistList"
                    label="Artist"
                    hint="Tag all Files with this Artist (Optional)"
                    persistent-hint
                  ></v-combobox>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="importcomposer"
                    :items="composerList"
                    label="Composer"
                    hint="Tag all Files with this Composer (Optional)"
                    persistent-hint
                  ></v-combobox>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="importalbum"
                    label="Album"
                    hint="Tag all Files with this Album (Optional)"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="importgenre"
                    :items="genres"
                    label="Genre"
                    hint="Tag all Files with this Genre (Optional)"
                    persistent-hint
                  >
                  </v-combobox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-btn class="ma-2" color="#555" text @click="onDialogClose()">
              Close
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              class="ma-2"
              color="primary"
              :disabled="!importdir && !importfilepaths"
              text
              @click="importFiles()"
            >
              Import
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-toolbar-title></v-toolbar-title>

      <v-spacer></v-spacer>
      <!-- <v-text-field hide-details single-line></v-text-field>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn> -->
      <template>
        <div class="text-center">
          <v-menu bottom left offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                v-bind="attrs"
                v-on="on"
                icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dark dense>
              <v-list-item @click="clearFilters()">
                <v-list-item-icon><v-icon>mdi-refresh</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Clear Filters</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-toolbar>
    <div class="videolibrary__main">
      <div class="videolibrary__filter-first">
        <v-toolbar color="#00bcd4" dense>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }"
              ><v-icon v-on="on">mdi-filter</v-icon></template
            >
            <span>Filter By</span>
          </v-tooltip>
          <v-select
            v-model="filter"
            dense
            solo
            background-color="#00bcd4"
            :items="mainFilters"
            item-text="text"
            item-value="value"
            style="padding-top: 1.6rem"
            height="16"
            label="Select Filter"
            @change="onFilterChange()"
          ></v-select>
        </v-toolbar>
        <v-card dark class="mx-auto videolibrary__listing" max-width="100%">
          <v-list shaped dark>
            <v-list-item
              :class="{ videolibrary__highlight: currentFilterValue === cat }"
              @click="applyFilter(cat)"
              v-for="cat in categories"
              v-bind:key="cat"
              two-line
              link
            >
              <v-list-item-content>
                <v-list-item-title>{{ cat }}</v-list-item-title>
                <v-list-item-subtitle> </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action> </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
      <div class="videolibrary__filter-second">
        <v-toolbar color="#00bcd4" dense>
          <v-btn icon @click="changeFilterOrder()">
            <v-icon v-if="!isFilterAscending">mdi-sort-descending</v-icon>
            <v-icon v-if="isFilterAscending">mdi-sort-ascending</v-icon>
          </v-btn>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }"
              ><v-icon v-on="on">mdi-shape</v-icon></template
            >
            <span>Categorize By</span>
          </v-tooltip>
          <v-select
            dense
            solo
            background-color="#00bcd4"
            @change="onCategoryChange()"
            v-model="catFilter"
            :items="mainFilters"
            item-text="text"
            item-value="value"
            style="padding-top: 1.6rem"
            label="Select Categorization"
          ></v-select>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }"
              ><v-icon style="margin-left: 8px" v-on="on"
                >mdi-sort</v-icon
              ></template
            >
            <span>Sort By</span>
          </v-tooltip>
          <v-select
            dense
            solo
            background-color="#00bcd4"
            @change="onSortChange()"
            v-model="sortFilter"
            :items="sortOptions"
            item-text="text"
            item-value="value"
            style="padding-top: 1.6rem"
            label="Sort By"
          ></v-select>
          <v-btn icon @click="changeSortOrder()">
            <v-icon v-if="!isSortAscending">mdi-sort-descending</v-icon>
            <v-icon v-if="isSortAscending">mdi-sort-ascending</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card dark class="mx-auto videolibrary__listing" max-width="100%">
          <div v-for="header in sortedLibrary" v-bind:key="header.header">
            <v-subheader v-if="header.videos.length">{{
              header.header
            }}</v-subheader>
            <v-list shaped dark>
              <v-list-item
                v-for="(f, i) of header.videos"
                v-bind:key="f.id"
                two-line
              >
                <img
                  :src="'local-resource://' + thumbPath + '/' + f.thumbnailPath"
                  width="160"
                  v-image-fall-back
                  style="margin-right: 8px"
                />
                <v-list-item-content>
                  <v-list-item-title>{{ f.displayName }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="f.artist">{{ f.artist }} </span>
                    <span v-if="f.composer">| {{ f.composer }} </span>
                    <span v-if="f.album">| {{ f.album }} </span><br>
                    <span v-if="f.releaseYear">{{ f.releaseYear }} | </span>
                    <span v-if="f.genre">{{ f.genre }} | </span>
                    {{ f.duration | elapsedTime }} | {{ f.size }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <v-dialog
                      v-model="editDialog[i]"
                      persistent
                      max-width="900px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="openEditDialog(f)"
                        >
                          <v-icon>mdi-pencil-circle-outline</v-icon>
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          <span class="headline">Edit File Details</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="3">
                                <img
                                  :src="
                                    'local-resource://' +
                                    thumbPath +
                                    '/' +
                                    editedFile.thumbnailPath
                                  "
                                  width="160"
                                  v-image-fall-back
                                  style="margin-right: 8px"
                                />
                              </v-col>
                              <v-col cols="4">
                                <v-btn
                                  dark
                                  class="ma-2"
                                  color="#555"
                                  @click="getImagePath()"
                                >
                                  <v-icon>mdi-image-search</v-icon
                                  ><span>Choose Thumbnail (16:9)</span>
                                </v-btn>
                              </v-col>
                              <v-col cols="4">
                                <v-btn
                                  dark
                                  class="ma-2"
                                  color="#555"
                                  @click="getNewFilePath()"
                                >
                                  <v-icon>mdi-file-document-edit</v-icon
                                  ><span>Change File Path</span>
                                </v-btn>
                              </v-col>
                              <v-col cols="12">
                                {{ editedFile.filePath }}
                              </v-col>
                              <v-col cols="6">
                                <v-text-field
                                  v-model="editedFile.displayName"
                                  label="Display Name"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="6">
                                <v-combobox
                                  v-model="editedFile.album"
                                  :items="albumList"
                                  label="Album"
                                >
                                </v-combobox>
                              </v-col>
                              <v-col cols="6">
                                <v-combobox
                                  v-model="editedFile.artist"
                                  :items="artistList"
                                  label="Artist"
                                >
                                </v-combobox>
                              </v-col>
                              <v-col cols="6">
                                <v-combobox
                                  v-model="editedFile.composer"
                                  :items="composerList"
                                  label="Composer"
                                ></v-combobox>
                              </v-col>
                              <v-col cols="6">
                                <v-combobox
                                  v-model="editedFile.genre"
                                  :items="genres"
                                  label="Genre"
                                >
                                </v-combobox>
                              </v-col>
                              <v-col cols="6">
                                <v-text-field
                                  v-model="editedFile.releaseYear"
                                  label="Release Year"
                                  persistent-hint
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12">
                                <v-alert dense outlined type="error" :value="isEditError">
                                  Error Occurred During Editing: Please Try Again!
                                </v-alert>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn
                            class="ma-2"
                            color="#555"
                            text
                            @click="onEditDialogClose()"
                          >
                            Close
                          </v-btn>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="ma-2"
                            color="primary"
                            :disabled="!editedFile.id"
                            text
                            :loading="isEditing"
                            @click="editFileDetails()"
                          >
                            Edit
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog v-model="deleteConfirmDialog" max-width="600px">
                        <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          icon
                          v-bind="attrs"
                          v-on="on"
                          @click="openDeleteConfirmDialog(f)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          <span class="headline">Are you sure you want to delete this file?</span>
                        </v-card-title>
                        <v-list dense>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title
                                  v-text="deletedFile.displayName"
                                ></v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                        </v-list>
                        <v-col cols="12">
                          <v-alert dense outlined type="error" :value="isDeleteError">
                            Error Occurred During Deleting: Please Try Again!
                          </v-alert>
                        </v-col>
                        <v-card-actions>
                          <v-btn
                            class="ma-2"
                            color="#555"
                            text
                            @click="onDeleteDialogClose()"
                          >
                            Cancel
                          </v-btn>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="ma-2"
                            color="primary"
                            :disabled="!deletedFile.id"
                            text
                            :loading="isDeleting"
                            @click="deleteFile()"
                          >
                            Confirm Delete
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action> </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon @click="playVideoPlaylist(f)">
                    <v-icon color="grey lighten-1">
                      mdi-play-circle-outline</v-icon
                    >
                  </v-btn>
                  <!-- <v-btn icon>
                    <v-icon color="grey lighten-1"> mdi-playlist-plus</v-icon>
                  </v-btn> -->
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </div>
    </div>
    <v-dialog v-model="completeDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Import Complete</span>
        </v-card-title>
        <v-list dense>
          <div v-if="newFiles.length">
            <v-list-item v-for="(item, i) in newFiles" :key="i">
              <v-list-item-content>
                <v-list-item-title
                  v-text="item.displayName"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
          <div v-if="newFiles.length === 0" style="padding-left: 24px">
            No New Files Imported
          </div>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="ma-2"
            color="primary"
            text
            @click="
              completeDialog = false;
              newFiles.length = 0;
            "
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteResultDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">File Deleted Successfully!</span>
        </v-card-title>
        <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  v-text="deletedFile.displayName"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="ma-2"
            color="primary"
            text
            @click="
              deleteResultDialog = false;
              deletedFile = {};
            "
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style lang="scss">
.videolibrary {
  background-color: #1e1e1e;
  color: white;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  &__main {
    display: flex;
    height: calc(100% - 48px);
  }
  &__filter-first {
    width: 15rem;
    border-right: 1px solid #333;
  }
  &__filter-second {
    width: calc(100% - 15rem);
  }
  &__highlight {
    background-color: #333;
  }

  &__listing {
    width: 100%;
    height: calc(100vh - 48px - 75px - 45px - 48px);
    overflow-y: scroll;
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
.videotable table td {
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
<script>
const { remote } = require("electron");
const path = require("path");
import { ipcRenderer } from "electron";
const dbInstance = remote.getGlobal("db");
export default {
  name: "VideoLibrary",
  components: {},
  data: () => ({
    importgenre: null,
    importartist: null,
    importcomposer: null,
    importalbum: null,
    importdir: null,
    importfilepaths: null,
    editedFile: {},
    editFileChanged: false,
    dialog: false,
    completeDialog: false,
    deletedFile: {},
    deleteConfirmDialog: false,
    deleteResultDialog: false,
    editDialog: [],
    files: [],
    db: [],
    filter: null,
    currentFilterValue: "All",
    catFilter: null,
    sortFilter: null,
    isFilterAscending: true,
    isSortAscending: true,
    genres: [],
    albumList: [],
    artistList: [],
    composerList: [],
    mainFilters: [
      { text: "All", value: "all" },
      { text: "Genre", value: "genre" },
      { text: "Artist", value: "artist" },
      { text: "Composer", value: "composer" },
      { text: "Album", value: "album" },
    ],
    sortOptions: [
      { text: "Track Name", value: "displayName" },
      { text: "Genre", value: "genre" },
      { text: "Artist", value: "artist" },
      { text: "Composer", value: "composer" },
      { text: "Album", value: "album" },
      { text: "Year", value: "releaseYear" },
      { text: "Length", value: "duration" },
    ],
    categories: [],
    filteredDB: [],
    sortedLibrary: [],
    headerKeys: [],
    newFiles: [],
    isImporting: false,
    isEditing: false,
    isEditError: false,
    isDeleting: false,
    isDeleteError: false,
    thumbPath: path.join(remote.app.getPath("userData"), "thumbnails"),
  }),
  mounted() {
    this.db.length = 0;
    this.refreshDB();
    ipcRenderer.on("open-folder-dialog-reply", (event, data) => {
      this.isImporting = false;
      console.log("open-folder REPLIED", event, data);
      this.refreshDB();
    });
    ipcRenderer.on("get-directory-dialog-reply", (event, data) => {
      console.log("get-directory REPLIED", event, data);
      if (data && data.dir) {
        this.importdir = data.dir;
        this.importfilepaths = null;
      }
    });
    ipcRenderer.on("open-video-file-dialog-reply", (event, data) => {
      this.isImporting = false;
      console.log("get-video-file REPLIED", event, data);
      if (data && data.video && data.video.length) {
        this.editedFile.filePath = data.video[0];
        this.editFileChanged = true;
      }
    });
    ipcRenderer.on("open-image-file-dialog-reply", (event, data) => {
      this.isImporting = false;
      console.log("get-image-file REPLIED", event, data);
      if (data && data.image) {
        this.editedFile.thumbnailPath = data.image;
      }
    });
    ipcRenderer.on("open-video-file-dialog-reply", (event, data) => {
      this.isImporting = false;
      console.log("open-video-file REPLIED", event, data);
      if (data && data.video && data.video.length) {
        this.importdir = data.video[0];
      }
    });
    ipcRenderer.on("open-file-paths-dialog-reply", (event, data) => {
      this.isImporting = false;
      console.log("get-file-paths REPLIED", event, data);
      if (data && data.filePaths && data.filePaths.length) {
        this.importfilepaths = data.filePaths;
        this.importdir = null;
      }
    });
    ipcRenderer.on("import-files-dialog-reply", (event, data) => {
      console.log("import-files REPLIED", event, data);
      this.newFiles = data.files;
      this.completeDialog = true;
      this.resetValues();
      this.refreshDB();
      this.isImporting = false;
    });
    ipcRenderer.on("edit-file-dialog-reply", (event, data) => {
      console.log("edit-file REPLIED", event, data);
      if (data.isSuccess) {
        console.log('SUCCESS')
        this.editDialog = [];
        this.resetValues();
        this.refreshDB();
        this.isEditing = false;
      } else {
        this.isEditError = true;
        this.isEditing = false;
      }
    });
    ipcRenderer.on("delete-file-dialog-reply", (event, data) => {
      console.log("delete-file REPLIED", event, data);
      if (data.isSuccess) {
        console.log('SUCCESS')
        this.deleteConfirmDialog = false;
        this.deleteResultDialog = true;
        this.refreshDB();
        this.isDeleting = false;
      } else {
        this.isDeleteError = true;
        this.isDeleting = false;
      }
    });
  },
  methods: {
    resetValues() {
      this.importdir = null;
      this.importgenre = null;
      this.importartist = null;
      this.importcomposer = null;
      this.importalbum = null;
      this.editFileChanged = false;
      this.editedFile = {};
    },
    clearFilters() {
      this.$store.commit('changeFilter', '');
      this.$store.commit('changeCategorization', '');
      this.$store.commit('changeSortFilter', '');
      this.refreshDB();
    },
    refreshDB() {
      this.db.length = 0;
      this.files = [];
      dbInstance.readAll().then((videos) => {
        this.db = [];
        this.db = videos.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
        this.genres = this.getSetList("genre");
        this.albumList = this.getSetList("album");
        this.artistList = this.getSetList("artist");
        this.composerList = this.getSetList("composer");
        this.filteredDB = [...this.db];
        this.filter = this.$store.state.filter;
        this.onFilterChange();
      });
    },
    getSetList(param) {
      return [
        ...new Set(
          [...this.db]
            .filter((item) => item[param])
            .map((item) => item[param])
            .sort((a, b) => a.localeCompare(b))
        ),
      ];
    },
    openEditDialog(f) {
      this.editFileChanged = false;
      this.editedFile = { ...f };
    },
    getImagePath() {
      ipcRenderer.send("getImageFilePath", { id: this.editedFile.id });
    },
    getNewFilePath() {
      ipcRenderer.send("getVideoFilePath");
    },
    onEditDialogClose() {
      this.editDialog = [];
      this.editedFile = {};
    },
    editFileDetails() {
      setTimeout(() => {
        this.isEditing = true;
        this.isEditError = false;
        ipcRenderer.send("editVideoDetails", {
          file: this.editedFile,
          isFileChanged: this.editFileChanged,
        });
      }, 100); // Workaround for v-ComboBox on blur saving to model
    },
    openDeleteConfirmDialog(f) {
      this.isDeleting = false;
      this.deletedFile = { ...f };
    },
    onDeleteDialogClose() {
      this.deleteConfirmDialog = false;0
      this.deletedFile = {};
    },
    deleteFile() {
      this.isDeleting = true;
      this.isDeleteError = false;
      ipcRenderer.send("deleteVideo", {
        file: this.deletedFile
      });
    },
    onDialogClose() {
      this.dialog = false;
      this.importdir = null;
      this.importfilepaths = null;
    },
    getDir() {
      ipcRenderer.send("getDirectoryPath");
    },
    getFilePaths() {
      ipcRenderer.send("getFilePaths");
    },
    importFiles() {
      setTimeout(() => {
        this.isImporting = true;
        ipcRenderer.send("importFiles", {
          dir: this.importdir,
          filePaths: this.importfilepaths,
          artist: this.importartist,
          composer: this.importcomposer,
          album: this.importalbum,
          genre: this.importgenre,
        });
        this.dialog = false;
      }, 100); // Workaround for v-ComboBox on blur saving to model
    },
    openFolder() {
      this.isImporting = true;
      ipcRenderer.send("selectDirectory");
    },
    loadImage(path) {
      const image1 = document.getElementById("image-1");
      image1.src = `appName-safe-file-protocol://${path}`;
    },
    playVideoPlaylist(file) {
      const playlist = [];
      this.sortedLibrary.forEach((bin) => {
        playlist.push(...bin.videos);
      });
      this.$store.commit("changePlaylist", { name: "Library", playlist });
      this.$store.commit("changeFile", file);
    },
    openVideo(file) {
      // console.log('sidebar', file);
      this.$store.commit("changeFile", file);
      // console.log('sidebar', this.$store.state.file.name);
    },
    onFilterChange() {
      this.$store.commit('changeFilter', this.filter);
      this.getCategories(this.filter);
    },
    getCategories(filter) {
      if (!filter || filter === "all") {
        this.resetDBDisplay();
        this.categories = [];
      } else {
        this.categories = [
          ...new Set(
            [...this.db]
              .filter((item) => item[filter])
              .map((item) => item[filter])
              .sort((a, b) => a.localeCompare(b))
          ),
        ];
        this.categories.unshift("All");
        this.categories.push("Unclassified");
        this.applyFilter(this.currentFilterValue);
      }
    },
    applyFilter(value) {
      this.currentFilterValue = value;
      if (!value || value === "All") {
        this.resetDBDisplay();
        this.applyCategorization();
      } else if (value === "Unclassified") {
        this.filteredDB = [...this.db].filter(
          (video) => video[this.filter] === ""
        );
        this.applyCategorization();
      } else {
        this.filteredDB = [...this.db].filter(
          (video) => video[this.filter] === value
        );
        this.applyCategorization();
      }
    },
    onSortChange() {
      this.$store.commit('changeSortFilter', this.sortFilter);
      this.applySort();
    },
    applySort() {
      this.sortFilter = this.$store.state.sort;
      if (!this.sortFilter) {
        this.sortFilter = "displayName";
      }
      if (this.sortFilter === "duration") {
        this.sortedLibrary.forEach((bin) => {
          bin.videos.sort((a, b) =>
            this.isSortAscending
              ? a[this.sortFilter] - b[this.sortFilter]
              : b[this.sortFilter] - a[this.sortFilter]
          );
        });
      } else {
        this.sortedLibrary.forEach((bin) => {
          bin.videos.sort((a, b) =>
            this.isSortAscending
              ? a[this.sortFilter].localeCompare(b[this.sortFilter])
              : b[this.sortFilter].localeCompare(a[this.sortFilter])
          );
        });
      }
    },
    onCategoryChange() {
      this.$store.commit('changeCategorization', this.catFilter);
      this.applyCategorization();
    },
    applyCategorization() {
      this.catFilter = this.$store.state.categorization;
      if (!this.catFilter || this.catFilter === "all") {
        this.sortedLibrary = [{ header: "All", videos: this.filteredDB }];
        this.applySort();
      } else {
        this.headerKeys = this.getBinCategories(this.catFilter);
        this.sortedLibrary = this.headerKeys.map((key) => ({
          header: key ? key : "Unclassified",
          videos: [...this.filteredDB].filter(
            (vid) => vid[this.catFilter] === key
          ),
        }));
        this.applySort();
      }
    },
    getBinCategories(filter) {
      const categories = [
        ...new Set(
          [...this.filteredDB]
            .filter((item) => item[filter])
            .map((item) => item[filter])
            .sort((a, b) =>
              this.isFilterAscending ? a.localeCompare(b) : b.localeCompare(a)
            )
        ),
      ];
      categories.push("");
      return categories;
    },
    resetDBDisplay() {
      this.filteredDB = [...this.db];
      this.applyCategorization();
    },
    changeSortOrder() {
      this.isSortAscending = !this.isSortAscending;
      this.applySort();
    },
    changeFilterOrder() {
      this.isFilterAscending = !this.isFilterAscending;
      this.applyCategorization();
    },
  },
  watch: {
    sortFilter(newVal) {
      this.sortFilter = newVal;
    },
  },
};
</script>
