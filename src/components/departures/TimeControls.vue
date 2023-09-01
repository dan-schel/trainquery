<script setup lang="ts">
import { ref } from "vue";
import NumberWheel from "../common/NumberWheel.vue";
import { posMod } from "@schel-d/js-utils";

const hours = ref(7);
const minutes = ref(10);
</script>

<template>
  <div class="time-controls">
    <div class="time">
      <NumberWheel
        v-model="hours"
        :next="(c) => (c >= 12 ? null : c + 1)"
        :prev="(c) => (c <= 1 ? null : c - 1)"
        :stringify="(c) => c.toFixed()"
      ></NumberWheel>
      <p class="time-colon">:</p>
      <NumberWheel
        v-model="minutes"
        :next="(c) => posMod(c + 1, 60)"
        :prev="(c) => posMod(c - 1, 60)"
        :stringify="(c) => c.toFixed().padStart(2, '0')"
      ></NumberWheel>
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
