<script setup lang="ts">
import OneLineP from "../common/OneLineP.vue";
import Icon from "../icons/Icon.vue";
</script>

<template>
  <div class="controls">
    <button class="time-button">
      <Icon id="uil:clock" title="Time"></Icon>
      <OneLineP class="text">Now</OneLineP>
      <Icon id="uil:angle-down"></Icon>
    </button>
    <button class="filter-button">
      <Icon id="uil:filter"></Icon>
      <OneLineP class="text">Citybound Gippsland trains</OneLineP>
      <Icon id="uil:angle-down"></Icon>
    </button>
    <!-- <button class="reset-button" title="Reset">
      <Icon id="uil:redo"></Icon>
    </button> -->
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.controls {
  @include utils.raised-surface;
  max-width: 36rem;
  border-radius: 0.5rem;

  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 2.5rem 2.5rem;
  grid-template-areas:
    "time reset"
    "filter reset";
}
.time-button,
.filter-button,
.reset-button {
  @include template.content-text-icon;
  @include template.row;
  --button-rounding: 0;
}
.time-button,
.filter-button {
  @include template.button-hover;
  padding: 0rem 0.75rem;
  gap: 0.5rem;
  min-width: 0;

  .text {
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;

    :deep(p) {
      color: var(--content-color);
    }
  }
}
.time-button {
  grid-area: time;
  border-bottom: 1px solid var(--color-ink-20);
}
.filter-button {
  grid-area: filter;
}
.reset-button {
  @include template.button-filled;
  grid-area: reset;
  width: 2.5rem;
  justify-content: center;
}
.icon {
  font-size: 1.2rem;
}
@media screen and (min-width: 48rem) {
  .controls {
    grid-template-columns: 1fr 1fr auto;
    grid-template-rows: 2.5rem;
    grid-template-areas: "time filter reset";
  }
  .time-button {
    border-right: 1px solid var(--color-ink-20);
    border-bottom: none;
  }
}
</style>
