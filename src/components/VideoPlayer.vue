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
  data() {
    return {
      player: null,
    };
  },
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
      console.log('setsrc')
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
      this.player.on("ended", function () {
        window.playerEvents.playerEventEnded();
      });
      this.player.on("volumechange", function () {
        window.playerEvents.playerEventVolume();
      });
      this.player.on("error", function () {
        window.playerEvents.playerEventError();
      });
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
  },
  watch: {
    videoChange(newVideo) {
      // console.log('local-resource://'+newVideo.filePath);
      const url = 'local-resource://'+newVideo.filePath;
      this.player.src(url);
    },
  },
};
</script>