<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Icon from "../icons/Icon.vue";

const COUNTS_AS_HOME = 0.01;
const SENSITIVITY_TOUCH = 0.03;
const SENSITIVITY_MOUSE = 0.1;

const value = ref(0);
const next = computed(() => value.value + (offset.value > 0 ? 1 : -1));
const offset = ref(0);
const dragging = ref(false);

function handlePointerDown() {
  if (dragging.value) {
    return;
  }
  dragging.value = true;
}
function handlePointerMove(e: PointerEvent) {
  if (!dragging.value) {
    return;
  }
  offset.value +=
    e.movementY *
    (e.pointerType == "mouse" ? SENSITIVITY_MOUSE : SENSITIVITY_TOUCH);

  while (offset.value > 0.5) {
    value.value++;
    offset.value--;
  }
  while (offset.value < -0.5) {
    value.value--;
    offset.value++;
  }
}
function handlePointerUp() {
  if (!dragging.value) {
    return;
  }
  dragging.value = false;
  animateHome();
}
onMounted(() => {
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
});
onUnmounted(() => {
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", handlePointerUp);
});

function animateHome() {
  if (Math.abs(offset.value) < COUNTS_AS_HOME) {
    offset.value = 0;
    return;
  }

  offset.value *= 0.8;
  requestAnimationFrame(animateHome);
}
function handleUpButton() {
  value.value++;
  offset.value = -1;
  animateHome();
}
function handleDownButton() {
  value.value--;
  offset.value = 1;
  animateHome();
}
</script>

<template>
  <div
    class="wheel"
    :style="{
      '--current-offset': `${offset * 100}%`,
      '--next-offset': `${(offset + (offset > 0 ? -1 : 1)) * 100}%`,
    }"
    @pointerdown="handlePointerDown"
  >
    <button class="up-button" @click="handleUpButton">
      <Icon id="uil:angle-up"></Icon>
    </button>

    <p class="current">{{ value }}</p>
    <p class="next" :style="{ opacity: `${Math.abs(offset) * 100}%` }">
      {{ next }}
    </p>

    <button class="down-button" @click="handleDownButton">
      <Icon id="uil:angle-down"></Icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.wheel {
  display: grid;
  width: 4rem;
  height: 8rem;
  grid-template-columns: 1fr;
  grid-template-rows: 2fr 4fr 2fr;
  grid-template-areas: "up" "number" "down";

  // For ".current" and ".next".
  position: relative;

  // Allows this element to take control of it's touch gestures.
  touch-action: none;
}
.up-button,
.down-button {
  @include template.button-hover;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 1.2rem;
  }
}
.up-button {
  grid-area: up;
}
.down-button {
  grid-area: down;
}
.current,
.next {
  @include template.no-select;
  position: absolute;
  top: 50%;
  left: 50%;

  font-size: 2.5rem;
  font-weight: bold;

  pointer-events: none;
}
.current {
  transform: translate(-50%, calc(-50% + var(--current-offset)));
}
.next {
  transform: translate(-50%, calc(-50% + var(--next-offset)));
}
</style>
