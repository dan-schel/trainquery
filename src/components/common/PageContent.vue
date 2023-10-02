<script setup lang="ts">
defineProps<{
  title: string | null;
  titleMargin?: string;
}>();
</script>

<template>
  <main>
    <div class="content">
      <h1 v-if="title != null" :style="{ 'margin-bottom': titleMargin }">
        {{ title }}
      </h1>
      <slot></slot>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
main {
  @include template.page-centerer;
}
.content {
  padding: 0rem 1rem;
}
h1 {
  @include utils.h1;
  margin-top: 2rem;
}
</style>
