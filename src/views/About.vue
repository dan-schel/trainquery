<script setup lang="ts">
import { useHead } from "@vueuse/head";
useHead({
  title: "About | TrainQuery",
});
</script>

<template>
  <main>
    <h1>About page</h1>
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
