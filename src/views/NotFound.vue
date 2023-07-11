<script setup lang="ts"></script>

<template>
  <main>
    <h1>404</h1>
    <p>Error &mdash; Page not found</p>
  </main>
</template>

<style lang="scss" scoped>
@use "@/assets/css-template/import" as template;
main {
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;

  // For the h1.
  position: relative;
  height: 100vh;
  height: 100svh;
  width: 100vw;
  overflow: hidden;
}
h1 {
  position: absolute;

  color: var(--color-ink-10);
  font-weight: 900;
  font-size: min(36vw, 60vh);
  font-stretch: 125%;
  z-index: 0;

  @include template.no-select;
}
p {
  font-weight: 700;
  font-size: 1.5rem;
  z-index: 1;
  text-align: center;
}
</style>
