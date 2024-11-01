<script setup lang="ts">
import PTVStationSign from "./PTVStationSign.vue";

defineProps<{
  title: string;
  message: string;
}>();
</script>

<template>
  <main>
    <div class="content">
      <PTVStationSign
        class="decor"
        stopName="Error"
        platform="404"
        :colors="['var(--color-light-accent-red)']"
      ></PTVStationSign>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
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
  color: var(--color-text-strong);
}
.decor {
  @include template.no-select;
  --size: 1;
  margin-bottom: 2rem;
  align-self: flex-start;
}
</style>
