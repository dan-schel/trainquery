<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
useHead(
  generatePageHead({
    title: "Train map",
    allowIndexing: true,
    canonicalUrl: "/map",
  }),
);
</script>

<template>
  <main>
    <h1>Train map page</h1>
  </main>
</template>

<style scoped lang="scss">
main {
  align-items: center;
  padding: 2rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-ink-100);
}
</style>
