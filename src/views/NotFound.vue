<script setup lang="ts"></script>

<template>
  <main>
    <div class="content">
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
</style>
