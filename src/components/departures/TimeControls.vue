<script setup lang="ts">
import NumberWheel from "../common/NumberWheel.vue";
</script>

<template>
  <div class="time-controls">
    <div class="time">
      <NumberWheel></NumberWheel>
      <p class="time-colon">:</p>
      <NumberWheel></NumberWheel>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.time-controls {
  padding: 1rem;
}
.time {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
}
.time-colon {
  font-size: 2.5rem;
  font-weight: bold;
}
</style>
