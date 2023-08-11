<script setup lang="ts">
import PTVStationSign from "@/components/PTVStationSign.vue";
import { useHead } from "@vueuse/head";
useHead({
  title: "Not found",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<template>
  <main>
    <div class="content">
      <PTVStationSign
        class="decor"
        stopName="Error"
        platform="404"
        :colors="['var(--color-light-accent-red)']"
      ></PTVStationSign>
      <h1>Page not found</h1>
      <p>This page doesn't exist, at least not anymore!</p>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  @include template.page-centerer;
}
.content {
  padding: 2rem 1rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-ink-100);
}
.decor {
  @include template.no-select;
  align-self: flex-start;
  margin-bottom: 2rem;
  box-shadow: 0rem 0.2rem 0.2rem var(--color-shadow-10);
}
</style>
