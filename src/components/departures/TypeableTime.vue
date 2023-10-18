<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { TypeableTime } from "./helpers/typeable-time";

const props = defineProps<{
  modelValue: TypeableTime;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", newValue: TypeableTime): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

function handleTimeInput(_e: Event) {
  const e = _e as InputEvent;
  if (e.inputType == "insertText") {
    emit("update:modelValue", props.modelValue.type(e.data ?? ""));
  } else if (e.inputType == "deleteContentBackward") {
    emit("update:modelValue", props.modelValue.backspace());
  } else if (e.inputType == "deleteContentForward") {
    emit("update:modelValue", props.modelValue.delete());
  }
}

onMounted(() => {
  // Doesn't work without the delay for some reason :/
  setTimeout(() => inputRef.value?.focus(), 100);
});
</script>

<template>
  <div>
    <input type="text" ref="inputRef" @beforeinput="handleTimeInput" />
    <p>00:00</p>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
input {
  grid-area: input;
  z-index: 5;
  opacity: 0;
}
p {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: calc(50% - 1.25rem);
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-ink-20);
}
</style>
