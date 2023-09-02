<script setup lang="ts">
import OneLineP from "../common/OneLineP.vue";
import SimpleButton from "../common/SimpleButton.vue";
import Departure from "./Departure.vue";
import { RouterLink } from "vue-router";

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
        <RouterLink class="link title" to="">Officer</RouterLink>
        <span class="dot">•</span>
        <RouterLink class="link subtitle" to="">Citybound trains</RouterLink>
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
@use "@/assets/utils" as utils;
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

  @include utils.raised-surface;
  border-radius: 0.75rem;
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
