<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <main>
    <div class="content">
      <h1>{{ title }}</h1>
      <slot></slot>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  @include template.page-centerer;
}
.content {
  padding: 0rem 1rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-ink-100);
  margin-top: 2rem;
}
</style>
