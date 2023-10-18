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
  e.preventDefault();

  if (e.inputType == "insertText") {
    emit("update:modelValue", props.modelValue.type(e.data ?? ""));
  } else if (e.inputType == "deleteContentBackward") {
    emit("update:modelValue", props.modelValue.backspace());
  }

  return false;
}

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <div class="typeable-time">
    <input type="text" ref="inputRef" @beforeinput="handleTimeInput" />
    <p>
      <span v-if="modelValue.hour.length < 2">{{
        "".padEnd(2 - modelValue.hour.length, "0")
      }}</span>
      <strong v-if="modelValue.hour.length > 0">{{ modelValue.hour }}</strong>
      <span v-if="!modelValue.explicitlyDivided">:</span>
      <strong v-if="modelValue.explicitlyDivided">:</strong>
      <span v-if="modelValue.minute.length < 2">{{
        "".padEnd(2 - modelValue.minute.length, "0")
      }}</span>
      <strong v-if="modelValue.minute.length > 0">{{
        modelValue.minute
      }}</strong>
      <strong v-if="modelValue.ampm.length > 0">{{ modelValue.ampm }}</strong>
      <span v-if="modelValue.ampm.length == 1">m</span>
    </p>
    <div class="preview"></div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.typeable-time {
  position: relative;
}
input {
  z-index: 2;
  justify-self: stretch;
  align-self: stretch;
  flex-grow: 1;
  opacity: 0;
}
p {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: var(--color-ink-20);
  font-size: 2.5rem;

  strong {
    color: var(--color-ink-80);
  }
}
</style>
