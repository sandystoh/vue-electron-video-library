<template>
  <div class="empty">
  </div>
</template>
<style lang="scss">
</style>
<script>

export default {
  name: "Empty",
  components: {
  },
  mounted() {
    this.$store.commit('changeLeftPanelWidth', 0);
  },
  methods: {
    openVideo() {
      console.log('home')
    }
  }
};
</script>
