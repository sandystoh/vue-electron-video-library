<template>
  <div class="playbar__main">
    <div class="playbar__title">{{ file.displayName }}<br>
      <div class="playbar__subtitle">{{ file.duration | elapsedTime }} 
        <span v-if="file.album">| {{ file.album }} </span>
        <span v-if="file.artist">| {{ file.artist }}</span></div>
    </div>
    <div class="playbar__btns">
      <v-btn dark @click="prevVideo()"
        ><v-icon>mdi-skip-previous</v-icon></v-btn
      >
      <v-btn dark @click="playPause()">
        <v-icon v-if="isPaused">mdi-play</v-icon>
        <v-icon v-if="!isPaused">mdi-pause</v-icon>
      </v-btn>
      <v-btn dark @click="nextVideo()"><v-icon>mdi-skip-next</v-icon></v-btn>
    </div>
  </div>
</template>
<style lang="scss">
.playbar {
  &__main {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
  &__title {
    padding: 20px;
    height: 75px;
    font-size: 18px;
    flex: 1;
  }
  &__subtitle {
    font-size: 12px;
  }
  &__btns {
    flex: 0 0 250px;
    display: flex;
    align-items: center;
  }
}
</style>
<script>
export default {
  name: "Trackbar",
  components: {},
  data: () => ({
    file: { name: "" },
    isPaused: true,
  }),
  mounted() {},
  computed: {
    videoChange() {
      return this.$store.state.file;
    },
    pauseChange() {
      return this.$store.state.isPaused;
    },
  },
  watch: {
    videoChange(newVideo) {
      this.file = newVideo;
    },
    pauseChange(isPaused) {
      this.isPaused = isPaused;
    },
  },
  methods: {
    prevVideo() {
      this.$root.$emit("trackbarprev");
    },
    playPause() {
      this.$root.$emit("trackbarplaypause");
    },
    nextVideo() {
      this.$root.$emit("trackbarnext");
    },
  },
};
</script>
