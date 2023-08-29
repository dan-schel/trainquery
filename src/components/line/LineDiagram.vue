<script setup lang="ts">
import { computed } from "vue";
import { type LineDiagramData } from "shared/system/routes/line-routes";
import type { StopID } from "shared/system/ids";

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
      indented: type == "loop" || type == "first-branch",
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
        [entry.type]: true,
        transparent: entry.transparent,
        'transparent-threshold': entry.transparentThreshold,
        indented: entry.indented,
        'first-of-type': entry.firstOfType,
        'last-of-type': entry.lastOfType,
      }"
    >
      <div class="visual">
        <div
          class="rod-top"
          v-if="!(entry.firstEver || (entry.indented && entry.firstOfType))"
        ></div>

        <div
          class="tick"
          :class="{
            end:
              (entry.firstEver && entry.type != 'loop') ||
              entry.lastEver ||
              (entry.type == 'first-branch' && entry.lastOfType),
            express: entry.express,
          }"
        ></div>

        <div
          class="rod-bottom"
          v-if="!(entry.lastEver || (entry.indented && entry.lastOfType))"
        ></div>

        <div class="rod-unindented" v-if="entry.indented"></div>

        <svg
          width="48"
          height="24"
          view-box="0 0 48 24"
          v-if="entry.type == 'loop' && entry.firstOfType"
          class="loop-cap"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="6.4"
            d="M 12 24 v -6 C 12 6, 36 6, 36 18 v 6"
          />
        </svg>

        <svg
          width="48"
          height="24"
          view-box="0 0 48 24"
          v-if="entry.type == 'loop' && entry.lastOfType"
          class="loop-join"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="6.4"
            d="M 36 0 C 36 18, 12 12, 12 24"
          />
        </svg>

        <svg
          width="48"
          height="24"
          view-box="0 0 48 24"
          v-if="entry.type == 'first-branch' && entry.firstOfType"
          class="branch-split"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="6.4"
            d="M 12 0 C 12 12, 36 6, 36 24"
          />
        </svg>
      </div>

      <div class="label">
        <slot name="stop" :stop="entry.stop" :express="entry.express"></slot>
      </div>

      <div class="visual-extra">
        <div
          class="rod-extra"
          v-if="!(entry.lastEver || (entry.indented && entry.lastOfType))"
        ></div>
        <div class="rod-unindented-extra" v-if="entry.indented"></div>
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
$loop-cap-margin: 0.9rem;
$loop-join-margin: 0.75rem;
$branch-split-margin: 0.75rem;
$branch-end-margin: 0.5rem;

.diagram {
  @include line-colors.accent-classes;
  --stop-gap: 0.5rem;
}
.stop {
  // For positioning the visual, and not having it interfere with the labels.
  display: grid;
  grid-template-columns: 2rem 1fr;
  grid-template-rows: auto auto;

  &.transparent {
    opacity: 0.5;
  }
  &.transparent-threshold .rod-top {
    opacity: 0.5;
  }
  &:not(:last-child) {
    margin-bottom: var(--stop-gap);
  }

  // Indented stops give more space to the "visual" diagram elements.
  &.indented {
    grid-template-columns: 3.5rem 1fr;

    .visual,
    .visual-extra {
      --indent: 1.5rem;
    }
  }
}

.visual,
.visual-extra {
  --indent: 0rem;

  // For positioning stop ticks, rods, and SVGs.
  position: relative;
  > * {
    position: absolute;
  }
}

.tick {
  background-color: var(--color-accent);

  width: $rod-width + $tick-width;
  height: $tick-height;

  left: $tick-width;
  top: 50%;
  transform: translate(var(--indent), -50%);

  // Show a tick on both sides if this is a terminus.
  &.end {
    left: 0;
    width: $tick-width + $rod-width + $tick-width;
  }

  // Use this tick mark as the rod if it runs express.
  &.express {
    width: $rod-width;
  }
}

.rod-top,
.rod-bottom,
.rod-extra,
.rod-unindented,
.rod-unindented-extra {
  background-color: var(--color-accent);

  width: $rod-width;

  top: 0;
  bottom: 0;
}

// These types of rod should follow the --indent variable...
.rod-top,
.rod-bottom,
.rod-extra {
  left: calc(var(--indent) + $tick-width);
}
// ... and these don't need to.
.rod-unindented,
.rod-unindented-extra {
  left: $tick-width;
}

// Stretch from the top of the first row to the top of the stop tick.
.rod-top {
  bottom: calc(50% + $tick-height * 0.5);
}

// Stretch from the bottom of the stop tick to the bottom of the first row.
.rod-bottom {
  top: calc(50% + $tick-height * 0.5);
}

// Stretch from the top of the second row, across the margin between stops, to
// the top of the first row of the next stop.
.rod-extra,
.rod-unindented-extra {
  bottom: calc(var(--stop-gap) * -1);
}

.visual svg {
  color: var(--color-accent);

  // SVGs re-used from melbpt project, which are slightly oversized, so this
  // adjustment is needed.
  left: -0.25rem;
}

// These SVGs align their bottoms with the top of the stop tick.
.loop-cap,
.branch-split {
  bottom: calc(50% + $tick-width * 0.5);
}

// This SVG aligns it's top with the bottom of the stop tick.
.loop-join {
  top: calc(50% + $tick-width * 0.5);
}

// The last loop stop has extra space beneath itself to the next stop, to allow
// enough space for the loop join SVG.
.loop.last-of-type {
  margin-bottom: calc(var(--stop-gap) + $loop-join-margin);
  .rod-unindented-extra {
    bottom: calc(var(--stop-gap) * -1 - $loop-join-margin);
  }
}

// The first stop after branching has extra space above itself to allow enough
// space for the branch split SVG.
.first-branch.first-of-type {
  margin-top: $branch-split-margin;
  .rod-unindented {
    top: -$branch-split-margin;
  }
}

// The first loop stop has extra space above itself to allow enough space for
// the loop cap SVG.
.loop.first-of-type {
  margin-top: $loop-cap-margin;

  // Shorten the unindented rod to line up with the bottom of the loop cap SVG.
  .rod-unindented {
    top: calc(50% - $tick-height * 0.5);
  }
}

// The last stop in the first branch has extra space beneath itself to the next
// stop, just because it looks better (provides a bit of visual separation
// between the two branches).
.first-branch.last-of-type {
  margin-bottom: calc(var(--stop-gap) + $branch-end-margin);
  .rod-unindented-extra {
    bottom: calc(var(--stop-gap) * -1 - $branch-end-margin);
  }
}
</style>
