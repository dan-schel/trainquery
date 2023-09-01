<script setup lang="ts" generic="T">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Icon from "../icons/Icon.vue";

const COUNTS_AS_HOME = 0.01;
const SENSITIVITY_TOUCH = 0.03;
const SENSITIVITY_MOUSE = 0.06;

const props = defineProps<{
  modelValue: T;
  next: (current: T) => T | null;
  prev: (current: T) => T | null;
  stringify: (value: T) => string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", newValue: T): void;
}>();

const offset = ref(0);
const alternate = computed(() =>
  offset.value >= 0
    ? props.next(props.modelValue)
    : props.prev(props.modelValue)
);
const dragOffset = ref<number | null>(null);

function handlePointerDown(e: PointerEvent) {
  e.preventDefault();
  if (dragOffset.value != null) {
    return;
  }
  dragOffset.value = e.pageY;
}
function handlePointerMove(e: PointerEvent) {
  if (dragOffset.value == null) {
    return;
  }

  // e.movementY is undefined on iPad Safari (otherwise remembering the
  // dragOffset wouldn't be necessary!)
  offset.value +=
    (e.pageY - dragOffset.value) *
    (e.pointerType == "mouse" ? SENSITIVITY_MOUSE : SENSITIVITY_TOUCH);

  dragOffset.value = e.pageY;

  while (offset.value > 0.5) {
    const nextValue = props.next(props.modelValue);
    if (nextValue == null) {
      offset.value = 0.5;
      break;
    }
    emit("update:modelValue", nextValue);
    offset.value--;
  }
  while (offset.value < -0.5) {
    const prevValue = props.prev(props.modelValue);
    if (prevValue == null) {
      offset.value = -0.5;
      break;
    }
    emit("update:modelValue", prevValue);
    offset.value++;
  }
}
function handlePointerUp() {
  if (dragOffset.value == null) {
    return;
  }
  dragOffset.value = null;
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
  const nextValue = props.next(props.modelValue);
  if (nextValue == null) {
    return;
  }
  emit("update:modelValue", nextValue);
  offset.value = -1;
  animateHome();
}
function handleDownButton() {
  const prevValue = props.prev(props.modelValue);
  if (prevValue == null) {
    return;
  }
  emit("update:modelValue", prevValue);
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

    <p class="current">{{ stringify(modelValue as T) }}</p>
    <p class="next" :style="{ opacity: `${Math.abs(offset) * 100}%` }">
      {{ alternate == null ? "" : stringify(alternate as T) }}
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
  min-width: 3rem;
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
