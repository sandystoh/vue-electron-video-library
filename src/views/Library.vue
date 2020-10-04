<template>
  <div class="library">
    <VideoLibrary />
  </div>
</template>
<style lang="scss">
.library {
  height: 100%;
  width: 100%;
}
</style>
<script>
import VideoLibrary from '@/components/VideoLibrary.vue';
export default {
  name: "Library",
  components: {
    VideoLibrary
  },
  mounted() {
    this.$store.commit('changeLeftPanelWidth', 100);
  },
  methods: {
    openVideo() {
      console.log('home')
    }
  }
};
</script>
