<script setup lang="ts" generic="T">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Icon from "../icons/Icon.vue";

interface Props<T> {
  modelValue: T;
  next: (current: T) => T | null;
  prev: (current: T) => T | null;
  stringify: (value: T) => string;
  horizontal?: boolean;
}
const props = withDefaults(defineProps<Props<T>>(), {
  horizontal: false,
});

const CLICK_THRESHOLD = 5;
const COUNTS_AS_HOME = 0.01;
const SENSITIVITY_TOUCH = props.horizontal ? 0.01 : 0.03;
const SENSITIVITY_MOUSE = props.horizontal ? 0.02 : 0.06;

const emit = defineEmits<{
  (e: "update:modelValue", newValue: T): void;
  (e: "numberClicked"): void;
}>();

const offset = ref(0);
const alternate = computed(() =>
  offset.value >= 0
    ? props.next(props.modelValue)
    : props.prev(props.modelValue),
);
const dragOffset = ref<number | null>(null);
const dragLength = ref<number | null>(null);

function handlePointerDown(e: PointerEvent) {
  e.preventDefault();
  if (dragOffset.value != null) {
    return;
  }
  const hitButton =
    !(e.target instanceof HTMLDivElement) ||
    !e.target.classList.contains("wheel");
  dragLength.value = hitButton ? null : 0;
  dragOffset.value = props.horizontal ? -e.pageX : -e.pageY;
}
function handlePointerMove(e: PointerEvent) {
  if (dragOffset.value == null) {
    return;
  }

  // e.movementY is undefined on iPad Safari (otherwise remembering the
  // dragOffset wouldn't be necessary!)
  const delta = (props.horizontal ? -e.pageX : -e.pageY) - dragOffset.value;
  offset.value +=
    delta * (e.pointerType == "mouse" ? SENSITIVITY_MOUSE : SENSITIVITY_TOUCH);
  if (dragLength.value != null) {
    dragLength.value += Math.abs(delta);
  }
  dragOffset.value = props.horizontal ? -e.pageX : -e.pageY;

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
  if (dragLength.value != null && dragLength.value < CLICK_THRESHOLD) {
    emit("numberClicked");
  }
  dragLength.value = null;
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
function handlePrevButton() {
  const prevValue = props.prev(props.modelValue);
  if (prevValue == null) {
    return;
  }
  emit("update:modelValue", prevValue);
  offset.value = 1;
  animateHome();
}
function handleNextButton() {
  const nextValue = props.next(props.modelValue);
  if (nextValue == null) {
    return;
  }
  emit("update:modelValue", nextValue);
  offset.value = -1;
  animateHome();
}
</script>

<template>
  <div
    class="wheel"
    :class="{
      horizontal: horizontal,
    }"
    :style="{
      '--current-offset': `${offset}%`,
      '--next-offset': `${offset + (offset > 0 ? -1 : 1)}%`,
    }"
    @pointerdown="handlePointerDown"
  >
    <button
      class="prev-button"
      @click="handlePrevButton"
      title="Previous value"
    >
      <Icon :id="horizontal ? 'uil:angle-left' : 'uil:angle-up'"></Icon>
    </button>

    <p class="current">{{ stringify(modelValue as T) }}</p>
    <p class="next" :style="{ opacity: `${Math.abs(offset) * 100}%` }">
      {{ alternate == null ? "" : stringify(alternate as T) }}
    </p>

    <button class="next-button" @click="handleNextButton" title="Next value">
      <Icon :id="horizontal ? 'uil:angle-right' : 'uil:angle-down'"></Icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.wheel {
  display: grid;
  overflow: hidden;

  // For ".current" and ".next".
  position: relative;

  // Allows this element to take control of it's touch gestures.
  touch-action: none;

  &:not(.horizontal) {
    min-width: 3rem;
    min-height: 6rem;
    grid-template-columns: 1fr;
    grid-template-rows: 2rem 1fr 2rem;
    grid-template-areas: "a" "number" "b";

    .current {
      transform: translate(
        -50%,
        calc(-50% - var(--current-offset) * var(--scroll-offset, 100))
      );
    }
    .next {
      transform: translate(
        -50%,
        calc(-50% - var(--next-offset) * var(--scroll-offset, 100))
      );
    }
  }
  &.horizontal {
    min-width: 10rem;
    min-height: 2rem;
    grid-template-columns: 2rem 1fr 2rem;
    grid-template-rows: 1fr;
    grid-template-areas: "a number b";

    .current {
      transform: translate(
        calc(-50% - var(--current-offset) * var(--scroll-offset, 100)),
        -50%
      );
    }
    .next {
      transform: translate(
        calc(-50% - var(--next-offset) * var(--scroll-offset, 100)),
        -50%
      );
    }
  }
}
.prev-button,
.next-button {
  @include template.button-hover;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 1.2rem;
  }
}
.prev-button {
  grid-area: a;
}
.next-button {
  grid-area: b;
}
.current,
.next {
  @include template.no-select;
  position: absolute;
  top: 50%;
  left: 50%;
  width: max-content;
  height: max-content;

  font-size: var(--wheel-text-size, 2.5rem);
  font-weight: bold;

  pointer-events: none;
}
</style>
