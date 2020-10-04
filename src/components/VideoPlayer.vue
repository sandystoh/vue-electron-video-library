<template>
  <div>
    <video
      ref="videoPlayer"
      playsinline
      id="videoPlayer"
      class="video-js vjs-default-skin"
      width="100%"
      controls
      preload="auto"
      data-setup='{ "aspectRatio":"16:9" }'
    ></video>
  </div>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "VideoPlayer",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data: () => ({
    player: null,
    activeFile: null,
    playlist: [],
  }),
  methods: {
    playerInitialize() {
      this.player = videojs(
        this.$refs.videoPlayer,
        this.options,
        function onPlayerReady() {
          console.log("onPlayerReady", this);
        }
      );
    },
    playerDispose() {
      this.player.dispose();
    },

    playerPlay() {
      this.player.play();
    },
    playerPause() {
      this.player.pause();
    },

    playerSetSrc(url) {
      console.log("setsrc");
      this.player.src(url);
    },
    playerSetVolume(float) {
      this.player.volume(float);
    },
    playerSetPoster(url) {
      this.player.poster(url);
    },
    playerSetTime(time) {
      this.player.currentTime(time);
    },

    playerEventEnded() {
      console.log("ended");
    },
    playerEventVolume() {
      this.volume = this.player.volume();
    },
    playerEventError() {
      console.log(this.playerGetError());
    },

    playerGetPaused() {
      return this.player.paused();
    },
    playerGetTime() {
      return this.player.currentTime();
    },
    playerGetError() {
      return this.player.error().message;
    },

    playerSetupEvents() {
      this.player.on("ended", () => {
        window.playerEvents.playerEventEnded();
        this.nextVideo();
      });
      this.player.on("volumechange", function () {
        window.playerEvents.playerEventVolume();
      });
      this.player.on("error", function () {
        window.playerEvents.playerEventError();
      });
      this.$root.$on("trackbarprev", () => {
        this.prevVideo();
      });
      this.$root.$on("trackbarplaypause", () => {
        if (this.playerGetPaused()) {
          this.playerPlay();
          this.$store.commit("changePausedStatus", false);
        } else {
          this.playerPause();
          this.$store.commit("changePausedStatus", true);
        }
      });
      this.$root.$on("trackbarnext", () => {
        this.nextVideo();
      });
    },
    prevVideo() {
      const activeIndex = this.playlist.findIndex(
        (f) => f.id === this.activeFile.id
      );
      if (activeIndex > -1 && activeIndex !== 0) {
        this.$store.commit("changeFile", this.playlist[activeIndex - 1]);
      }
    },
    nextVideo() {
      const activeIndex = this.playlist.findIndex(
        (f) => f.id === this.activeFile.id
      );
      if (activeIndex > -1 && activeIndex !== this.playlist.length - 1) {
        this.$store.commit("changeFile", this.playlist[activeIndex + 1]);
      }
    },
  },
  mounted() {
    window.playerEvents = this;
    this.playerInitialize();
    this.playerSetupEvents();
  },
  beforeDestroy() {
    this.playerDispose();
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
      // console.log('local-resource://'+newVideo.filePath);
      this.activeFile = newVideo;
      const url = "local-resource://" + newVideo.filePath;
      this.player.src(url);
      this.$store.commit("changePausedStatus", false);
    },
    playlistChange(newPlaylist) {
      this.playlist = newPlaylist.playlist;
    },
  },
};
</script>