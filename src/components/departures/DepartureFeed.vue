<script setup lang="ts">
import Departure from "./Departure.vue";
</script>

<template>
  <div class="feed">
    <Departure></Departure>
    <div class="divider"></div>
    <Departure></Departure>
    <div class="divider"></div>
    <Departure></Departure>
    <div class="divider"></div>
    <Departure></Departure>
    <div class="divider"></div>
    <Departure></Departure>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.feed {
  display: grid;
  grid-auto-rows: 5.8rem 1px;

  background-color: var(--color-paper-20);
  border-radius: 0.75rem;
  border: 1px solid var(--color-ink-10);
  box-shadow: 0 0.1rem 0.2rem var(--color-shadow-10);
}
.divider {
  height: 1px;
  margin: 0rem 1rem;
  border-bottom: 1px solid var(--color-ink-20);
}
</style>
