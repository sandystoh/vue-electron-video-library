<template>
  <div>
    <video-player :options="videoOptions" />
  </div>
</template>
<style lang="scss">
</style>
<script>
import VideoPlayer from "@/components/VideoPlayer.vue";
export default {
  name: "VideoPreview",
  components: {
    VideoPlayer,
  },
  data: () => ({
    videoOptions: {
      autoplay: true,
      controls: true,
      sources: [],
    },
  }),
  mounted() {},
};
</script>
