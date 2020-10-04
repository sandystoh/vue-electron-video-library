<template>
  <div>
    <div class="playbar-title">{{file.name}}</div>
  </div>
</template>
<style lang="scss">
.playbar-title {
  padding: 20px;
  font-size: 18px;
}
</style>
<script>
export default {
  name: "Trackbar",
  components: {
  },
  data: () => ({file: {name: ''}}),
  mounted() {},
  computed: {
    videoChange() {
      console.log('videoChange');
      return this.$store.state.file;
    },
  },
  watch: {
    videoChange(newVideo) {
      console.log(newVideo);
      this.file = newVideo
    },
  },
};
</script>
