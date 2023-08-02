<script setup lang="ts">
import Icon, { type IconID } from "../icons/Icon.vue";

defineProps<{
  icon: IconID;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <RouterLink :to="{ name: 'about' }" class="result">
    <Icon :id="icon"></Icon>
    <div class="column">
      <p class="title">{{ title }}</p>
      <p class="subtitle" v-if="subtitle != null">{{ subtitle }}</p>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.result {
  @include template.button-hover;
  @include template.row;
  --button-rounding: 0;

  padding: 0.75rem 1rem;
}
.icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}
.column {
  justify-content: center;

  flex-shrink: 1;
  min-width: 0;
}
.title {
  color: var(--color-ink-100);
  font-weight: bold;
}
.subtitle {
  color: var(--color-ink-80);
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
</style>
