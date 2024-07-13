<script setup lang="ts" generic="T">
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";

export type AsyncState<T> = "loading" | "error" | "not-found" | { data: T };

defineProps<{
  state: AsyncState<T>;
}>();
</script>

<template>
  <slot
    v-if="typeof state === 'object'"
    :data="state.data"
    v-bind="$attrs"
  ></slot>
  <LoadingSpinner v-if="state === 'loading'" class="spinner"></LoadingSpinner>
  <p v-if="state === 'error'" class="error">Something went wrong.</p>
  <p v-if="state === 'not-found'" class="error">Not found.</p>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

.spinner {
  margin: auto;
}
.error {
  font-weight: bold;
  color: var(--color-error);
}
</style>
