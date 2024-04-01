<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
defineProps<{
  title: string;
  state: "loading" | "error" | "not-found";
}>();
</script>

<template>
  <PageContent :title="title" title-margin="1rem">
    <LoadingSpinner v-if="state === 'loading'" class="spinner"
      >Loading...</LoadingSpinner
    >
    <p v-if="state === 'not-found'" class="error">Not found.</p>
    <p v-if="state === 'error'" class="error">Something went wrong.</p>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.spinner {
  margin: auto;
}
.error {
  font-weight: bold;
  color: var(--color-error);
}
</style>
