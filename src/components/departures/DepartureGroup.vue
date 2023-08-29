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
  grid-template-columns: 1fr;
  row-gap: 1.5rem;
  column-gap: 1.5rem;
}
.feed {
  max-width: 40rem;
}
@media screen and (min-width: 48rem) {
  .group {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  }
}
</style>
