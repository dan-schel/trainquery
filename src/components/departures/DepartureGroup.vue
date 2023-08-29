<script setup lang="ts">
import DepartureFeed from "./DepartureFeed.vue";

defineProps<{
  allowPinning: boolean;
  count: number;
}>();
</script>

<template>
  <div class="group">
    <DepartureFeed
      v-for="num in count"
      :key="num"
      class="feed"
      :count="3"
      :allow-pinning="allowPinning"
    ></DepartureFeed>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.group {
  display: grid;
  // 22.25rem so that it merges to one when the navbar enters mobile mode.
  grid-template-columns: repeat(auto-fit, minmax(22.25rem, 1fr));
  row-gap: 1.5rem;
  column-gap: 1.5rem;
}
.feed {
  max-width: 40rem;
}
</style>
