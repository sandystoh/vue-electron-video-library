<template>
  <div
    class="resizable-pane"
    :style="{ cursor, userSelect }"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <section
      class="pane resizable"
      :style="{
        minWidth: minSize,
        maxWidth: maxSize,
        width: resizeValue + '%',
      }"
    >
      <slot name="resizable" />
    </section>
    <div class="resizer" @mousedown="onMouseDown" />
    <section
      class="pane"
      :style="{
        width: 'calc(100% - ' + resizeValue + '%)',
      }"
    >
      <slot />
    </section>
  </div>
</template>

<script>
export default {
  name: "ResizablePane",
  props: {
    minSize: {
      type: String,
      default: "0rem",
    },
    maxSize: {
      type: String,
      default: "calc(100% - 24rem)",
    },
    resizeType: {
      validator(value) {
        return ["vertical", "horizontal"].indexOf(value) >= 0;
      },
      default: "vertical",
    },
  },
  created() {
    window.addEventListener("resize", this.windowResized);
  },
  destroyed() {
    window.removeEventListener("resize", this.windowResized);
  },
  computed: {
    userSelect() {
      return this.isActive ? "none" : "";
    },
    cursor() {
      return this.isActive ? "col-resize" : "";
    },
    panelSizeChange() {
      return this.$store.state.leftPaneWidth;
    },
  },
  data() {
    return {
      isActive: false,
      resizeValue: 0,
    };
  },
  methods: {
    windowResized() {
      this.$root.$emit("windowresize", this.resizeValue);
    },
    onMouseDown() {
      this.isActive = true;
    },
    onMouseUp() {
      this.isActive = false;
    },
    onMouseMove(e) {
      if (e.buttons === 0 || e.which === 0) {
        this.isActive = false;
      }

      if (this.isActive) {
        let offset = 0;
        let target = e.currentTarget;
        while (target) {
          offset += target.offsetLeft;
          target = target.offsetParent;
        }

        const currentPage = e.pageX;
        const targetOffset = e.currentTarget.offsetWidth;
        const resizeValue =
          Math.floor(((currentPage - offset) / targetOffset) * 10000) / 100;

        if (resizeValue < 100) {
          this.resizeValue = resizeValue;
          this.$store.commit("changeLeftPanelWidth", resizeValue);
        }
      }
    },
  },
  watch: {
    panelSizeChange(newSize) {
      this.resizeValue = newSize;
    },
  },
};
// Reference used for mouse events: https://github.com/PanJiaChen/vue-split-pane
// Example usng split.js (could be useful): https://github.com/bajaniyarohit/vue-split-panel
</script>

<style scoped>
.resizable-pane {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
}

.pane {
  position: relative;
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  align-items: flex-start;
}

.pane.resizable {
  flex: none;
}

.resizer {
  cursor: col-resize;
  position: relative;
  width: 4px;
  margin: 0 -2px;
  z-index: 1;
}

.resizer::before {
  content: "";
  display: block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background-color: #eee;
  transition: background-color 250ms, box-shadow 250ms;
}

.resizer:hover::before {
  background-color: blue;
  box-shadow: 0 1px 4px 1px blue;
}
</style>
