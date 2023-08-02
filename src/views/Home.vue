<script setup lang="ts">
import { formatPageTitle } from "@/utils";
import { useHead } from "@vueuse/head";
useHead({
  title: formatPageTitle("Home"),
});
</script>

<template>
  <main>
    <h1>Home page</h1>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  align-items: center;
  padding: 2rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-ink-100);
}
</style>
