<script setup lang="ts">
defineProps<{
  stopName: string;
  platform: string;
  colors: string[];
}>();
</script>

<template>
  <div class="base">
    <div class="stop">
      <div class="stripe">
        <div
          class="stripe-color"
          v-for="color in colors"
          :key="color"
          :style="`background-color: ${color};`"
        ></div>
      </div>
      <p class="stop-name">{{ stopName }}</p>
    </div>
    <div class="divider"></div>
    <p class="platform">{{ platform }}</p>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.base {
  display: grid;
  grid-template-columns: auto 0.1em auto;
  background-color: #ffffff;
  height: 3em;
  border-radius: 0.1em 0.1em 0.4em 0.4em;
}
.divider {
  background-color: #cccccc;
}
.stop {
  display: grid;
  grid-template-rows: 0.1em auto;
  padding: 0.25em 0.25em 0 0.25em;
}
.stripe {
  flex-direction: row;
  height: 0.2em;
}
.stripe-color {
  flex-grow: 1;
  flex-shrink: 1;
}
.stop-name {
  font-size: 1.4em;
  font-weight: bold;
  padding: 0 1em;
  align-self: center;
}
.platform {
  font-size: 2em;
  font-weight: 500;
  padding: 0em 0.5em;
  align-self: center;
}
</style>
