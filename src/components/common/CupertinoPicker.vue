<script setup lang="ts" generic="T">
defineProps<{
  group: string;
  options: {
    key: string;
    data: T;
  }[];
  contentClass?: string;
}>();
</script>

<template>
  <div class="group">
    <label v-for="option in options" :key="option.key">
      <input type="radio" :name="group" autocomplete="off" />
      <div class="content" :class="contentClass">
        <slot :data="option.data"></slot>
      </div>
    </label>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.group {
  @include template.picker-cupertino($content-class: "content");
}
</style>
