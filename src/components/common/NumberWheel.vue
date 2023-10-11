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

const COUNTS_AS_HOME = 0.01;
const SENSITIVITY_TOUCH = props.horizontal ? 0.01 : 0.03;
const SENSITIVITY_MOUSE = props.horizontal ? 0.02 : 0.06;

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
  dragOffset.value = props.horizontal ? -e.pageX : e.pageY;
}
function handlePointerMove(e: PointerEvent) {
  if (dragOffset.value == null) {
    return;
  }

  // e.movementY is undefined on iPad Safari (otherwise remembering the
  // dragOffset wouldn't be necessary!)
  offset.value +=
    ((props.horizontal ? -e.pageX : e.pageY) - dragOffset.value) *
    (e.pointerType == "mouse" ? SENSITIVITY_MOUSE : SENSITIVITY_TOUCH);

  dragOffset.value = props.horizontal ? -e.pageX : e.pageY;

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
function handleButtonA() {
  const nextValue = props.horizontal
    ? props.prev(props.modelValue)
    : props.next(props.modelValue);
  if (nextValue == null) {
    return;
  }
  emit("update:modelValue", nextValue);
  offset.value = props.horizontal ? 1 : -1;
  animateHome();
}
function handleButtonB() {
  const prevValue = props.horizontal
    ? props.next(props.modelValue)
    : props.prev(props.modelValue);
  if (prevValue == null) {
    return;
  }
  emit("update:modelValue", prevValue);
  offset.value = props.horizontal ? -1 : 1;
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
    <button class="button-a" @click="handleButtonA">
      <Icon :id="horizontal ? 'uil:angle-left' : 'uil:angle-up'"></Icon>
    </button>

    <p class="current">{{ stringify(modelValue as T) }}</p>
    <p class="next" :style="{ opacity: `${Math.abs(offset) * 100}%` }">
      {{ alternate == null ? "" : stringify(alternate as T) }}
    </p>

    <button class="button-b" @click="handleButtonB">
      <Icon :id="horizontal ? 'uil:angle-right' : 'uil:angle-down'"></Icon>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.wheel {
  display: grid;
  --scroll-offset: 100;

  // For ".current" and ".next".
  position: relative;

  // Allows this element to take control of it's touch gestures.
  touch-action: none;

  &:not(.horizontal) {
    min-width: 3rem;
    height: 8rem;
    grid-template-columns: 1fr;
    grid-template-rows: 2rem 1fr 2rem;
    grid-template-areas: "a" "number" "b";

    .current {
      transform: translate(
        -50%,
        calc(-50% + var(--current-offset) * var(--scroll-offset))
      );
    }
    .next {
      transform: translate(
        -50%,
        calc(-50% + var(--next-offset) * var(--scroll-offset))
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
        calc(-50% - var(--current-offset) * var(--scroll-offset)),
        -50%
      );
    }
    .next {
      transform: translate(
        calc(-50% - var(--next-offset) * var(--scroll-offset)),
        -50%
      );
    }
  }
}
.button-a,
.button-b {
  @include template.button-hover;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 1.2rem;
  }
}
.button-a {
  grid-area: a;
}
.button-b {
  grid-area: b;
}
.current,
.next {
  @include template.no-select;
  position: absolute;
  top: 50%;
  left: 50%;

  font-size: var(--wheel-text-size, 2.5rem);
  font-weight: bold;

  pointer-events: none;
}
</style>
