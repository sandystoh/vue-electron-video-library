<template>
    <div id="app">
      <v-app>
      <Home />
      </v-app>
    </div>
</template>

<style lang="scss">
#app {
  font-family: "Fira Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 1.2rem;
  height: 100%;
  width: 100%;
  margin: 0;
}
.cursor-pointer {
  cursor: pointer;
}
</style>

<script>
import Home from "@/views/Home.vue";
export default {
  name: "App",
  components: {
    Home,
  },
};
</script>
