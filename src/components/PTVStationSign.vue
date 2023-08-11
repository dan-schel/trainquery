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
  // Just because inlining these gets messy quick and the way using em stacks is
  // not ideal.
  --0p1: calc(0.1rem * var(--size));
  --0p2: calc(0.2rem * var(--size));
  --0p25: calc(0.25rem * var(--size));
  --0p4: calc(0.4rem * var(--size));
  --0p75: calc(0.75rem * var(--size));
  --1p4: calc(1.4rem * var(--size));
  --2p5: calc(2.5rem * var(--size));
  --3p0: calc(3rem * var(--size));

  display: grid;
  grid-template-columns: auto var(--0p1) minmax(var(--3p0), auto);
  background-color: #ffffff;
  height: var(--3p0);
  border-radius: var(--0p1) var(--0p1) var(--0p4) var(--0p4);
  box-shadow: 0 var(--0p2) var(--0p2) var(--color-shadow-10);
}
.divider {
  background-color: #cccccc;
}
.stop {
  display: grid;
  grid-template-rows: var(--0p1) auto;
  padding: var(--0p25) var(--0p25) 0 var(--0p25);
}
.stripe {
  flex-direction: row;
  height: var(--0p25);
}
.stripe-color {
  flex-grow: 1;
  flex-shrink: 1;
}
.stop-name {
  font-size: var(--1p4);
  font-weight: bold;
  padding: 0 var(--1p4);
  align-self: center;
  color: #333333;
}
.platform {
  font-size: var(--2p5);
  font-weight: 400;
  padding: 0 var(--0p75);
  align-self: center;
  justify-self: center;
  color: #333333;
}
</style>
