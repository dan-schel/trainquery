<script setup lang="ts">
import OneLineP from "../common/OneLineP.vue";
import SimpleButton from "../common/SimpleButton.vue";
import Departure from "./Departure.vue";

defineProps<{
  count: number;
  allowPinning: boolean;
}>();
</script>

<template>
  <div
    class="feed"
    :style="{
      '--count': count,
    }"
  >
    <div class="header-row">
      <OneLineP class="header">
        <a class="link title">Officer</a>
        <span class="dot">•</span>
        <a class="link subtitle">Citybound trains</a>
      </OneLineP>
      <SimpleButton
        v-if="allowPinning"
        :content="{ icon: 'majesticons:pin-line', altText: 'Pin widget' }"
      ></SimpleButton>
    </div>
    <div class="departures">
      <Departure class="departure"></Departure>
      <Departure class="departure"></Departure>
      <Departure class="departure"></Departure>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.header-row {
  @include template.row;
  height: 2rem;
}
.header {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
}
.title {
  --color-accent: var(--color-ink-100);
  font-weight: bold;
  font-size: 1rem;
}
.dot {
  margin: 0rem 0.25rem;
}
.subtitle {
  --color-accent: var(--color-ink-80);
  font-size: 1rem;
}
.departures {
  display: grid;
  grid-template-rows: repeat(var(--count), 5.8rem);

  background-color: var(--color-paper-20);
  border-radius: 0.75rem;
  border: 1px solid var(--color-ink-10);
  box-shadow: 0 0.1rem 0.2rem var(--color-shadow-10);
  overflow: hidden;
}
.departure {
  // For the divider.
  position: relative;

  // The divider
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 1rem;
    right: 1rem;
    border-bottom: 1px solid var(--color-ink-20);
  }
}
</style>
