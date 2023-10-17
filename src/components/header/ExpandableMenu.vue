<script setup lang="ts">
import type { MenuItem } from "./Header.vue";
import SimpleButton from "../common/SimpleButton.vue";

defineProps<{
  items: MenuItem[];
}>();
defineEmits<{
  (e: "navigation"): void;
}>();
</script>

<template>
  <div class="grid">
    <SimpleButton
      v-for="item in items"
      :key="item.routeName"
      :content="{ icon: item.icon, text: item.title }"
      :to="{ name: item.routeName }"
      layout="tile"
      theme="filled-neutral"
      @click="() => $emit('navigation')"
    ></SimpleButton>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  column-gap: 0.5rem;
  row-gap: 0.5rem;
  padding: 1rem;
}
</style>
