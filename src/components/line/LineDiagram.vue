<script setup lang="ts">
import { computed } from "vue";
import { type LineDiagramData } from "../../../shared/system/routes/line-routes";
import type { StopID } from "../../../shared/system/ids";

const props = defineProps<{
  diagram: LineDiagramData;
}>();

const stopList = computed(() => {
  function stopType(
    stops: { stop: StopID; express: boolean }[],
    type: string,
    transparentTo: number
  ) {
    return stops.map((s, i) => ({
      type: type,
      stop: s.stop,
      express: s.express,
      transparent: i < transparentTo,
      transparentThreshold: i == transparentTo,
      firstOfType: i == 0,
      lastOfType: i == stops.length - 1,
      firstEver: false,
      lastEver: false,
    }));
  }

  const d = props.diagram;
  const t = d.transparentTo;
  const result = [];
  result.push(...stopType(d.loop, "loop", t - result.length));
  result.push(...stopType(d.stops, "regular", t - result.length));
  result.push(...stopType(d.firstBranch, "first-branch", t - result.length));
  result.push(...stopType(d.secondBranch, "second-branch", t - result.length));
  result[0].firstEver = true;
  result[result.length - 1].lastEver = true;
  return result;
});
</script>

<template>
  <div class="diagram" :class="`accent-${diagram.color}`">
    <div
      class="stop"
      v-for="entry of stopList"
      :key="entry.stop"
      :class="{
        transparent: entry.transparent,
        transparentThreshold: entry.transparentThreshold,
      }"
    >
      <div class="visual">
        <div class="rod-top" v-if="!entry.firstEver"></div>
        <div
          class="tick"
          :class="{
            end: entry.firstEver || entry.lastEver,
            express: entry.express,
          }"
        ></div>
        <div class="rod-bottom" v-if="!entry.lastEver"></div>
      </div>
      <div class="label">
        <slot name="stop" :stop="entry.stop" :express="entry.express"></slot>
      </div>
      <div class="visual-extra">
        <div class="rod-extra" v-if="!entry.lastEver"></div>
      </div>
      <div class="label-extra">
        <slot
          name="stop-extra"
          :stop="entry.stop"
          :express="entry.express"
        ></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/line-colors" as line-colors;

$rod-width: 0.4rem;
$tick-width: 0.3rem;
$tick-height: 0.4rem;

.diagram {
  padding: 2rem 0rem;
  @include line-colors.accent-classes;
}
.stop {
  // For positioning the visual, and not having it interfere with the labels.
  display: grid;
  grid-template-columns: 2rem 1fr;
  grid-template-rows: auto auto;

  &.transparent {
    opacity: 0.5;
  }
  &.transparentThreshold .rod-top {
    opacity: 0.5;
  }
  &:not(:last-child) {
    margin-bottom: var(--stop-gap);
  }
}

.visual,
.visual-extra {
  position: relative;
}
.tick {
  position: absolute;
  background-color: var(--color-accent);

  left: $tick-width;
  width: $rod-width + $tick-width;

  top: 50%;
  height: $tick-height;
  transform: translate(0, -50%);

  &.end {
    left: 0;
    width: $tick-width + $rod-width + $tick-width;
  }
  &.express {
    width: $rod-width;
  }
}
.rod-top,
.rod-bottom,
.rod-extra {
  position: absolute;
  background-color: var(--color-accent);

  left: $tick-width;
  width: $rod-width;

  top: 0;
  bottom: 0;
}
.rod-top {
  bottom: calc(50% + $tick-height * 0.5);
}
.rod-bottom {
  top: calc(50% + $tick-height * 0.5);
}
.rod-extra {
  bottom: calc(var(--stop-gap) * -1);
}
</style>
