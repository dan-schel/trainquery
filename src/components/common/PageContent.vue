<script setup lang="ts">
defineProps<{
  title: string | null;
  titleMargin?: string;
}>();
</script>

<template>
  <main>
    <div class="content">
      <div
        class="title-row"
        v-if="title != null"
        :style="{ 'margin-bottom': titleMargin }"
      >
        <h1>
          {{ title }}
        </h1>
        <slot name="title-inline"> </slot>
      </div>
      <slot></slot>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
main {
  @include template.page-centerer;
  flex-grow: 1;
}
.content {
  padding: 0rem 1rem;
  flex-grow: 1;
}
h1 {
  @include utils.h1;
  min-width: 0;
  flex-shrink: 1;
}
.title-row {
  @include template.row;
  margin-top: 2rem;
  min-width: 0;
}
</style>
