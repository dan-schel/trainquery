<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useRoute } from "vue-router";
import { requireLine, requireLineID } from "@/utils/config-utils";

const lineID = requireLineID(useRoute().params.id as string);
const line = requireLine(lineID);

useHead({
  title: `${line.name} Line`,
});
</script>

<template>
  <main>
    <h1>{{ line.name }} Line</h1>
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
