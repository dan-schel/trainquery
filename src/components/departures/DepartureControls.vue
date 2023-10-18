<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import OneLineP from "../common/OneLineP.vue";
import Icon from "../icons/Icon.vue";
import FilterControls from "./FilterControls.vue";
import TimeControls from "./TimeControls.vue";
import { DepartureFilter } from "shared/system/timetable/departure-filter";
import { formatFilter } from "@/utils/format-filter";
import type { StopID } from "shared/system/ids";
import type { QLocalDateTime } from "shared/qtime/qdatetime";
import { formatRelativeTime } from "@/utils/format-qtime";
import { useNow } from "@/utils/now-provider";

const props = defineProps<{
  stop: StopID;
  filter: DepartureFilter;
  time: QLocalDateTime | null;
  isDefaultFilter: boolean;
}>();
const emit = defineEmits<{
  (e: "update:filter", newValue: DepartureFilter): void;
  (e: "update:time", newValue: QLocalDateTime | null): void;
}>();

const openDropdown = ref<"none" | "time" | "filter">("none");

const filterLabel = computed(() => formatFilter(props.filter, props.stop));
const showResetButton = computed(
  () => !props.isDefaultFilter || props.time != null
);

// Stores changes to the filter until the dropdown is closed, when the changes
// are sent back up to the stop page.
const filterElect = ref(props.filter);
watch(
  () => props.filter,
  () => {
    filterElect.value = props.filter;
  }
);

function handleTimeButtonClick() {
  openDropdown.value = openDropdown.value == "time" ? "none" : "time";
  emit("update:filter", filterElect.value);
}
function handleFilterButtonClick() {
  openDropdown.value = openDropdown.value == "filter" ? "none" : "filter";
  emit("update:filter", filterElect.value);
}
function closeDropdown() {
  openDropdown.value = "none";
  emit("update:filter", filterElect.value);
}
function handleKeyDown(e: KeyboardEvent) {
  if (e.code == "Escape") {
    openDropdown.value = "none";
    emit("update:filter", filterElect.value);
  }
}
function handleResetClicked() {
  emit("update:filter", DepartureFilter.default);
  emit("update:time", null);
}
function handleTimeSubmit(newValue: QLocalDateTime | null) {
  openDropdown.value = "none";
  emit("update:time", newValue);
}

const { local } = useNow();

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="controls" :class="{ 'can-reset': showResetButton }">
    <div class="buttons">
      <button class="time-button" @click="handleTimeButtonClick">
        <Icon id="uil:clock" title="Time"></Icon>
        <OneLineP class="text">
          <b v-if="time != null">{{ formatRelativeTime(time, local) }}</b>
          <template v-if="time == null">Now</template>
        </OneLineP>
        <Icon id="uil:angle-down"></Icon>
      </button>
      <button class="filter-button" @click="handleFilterButtonClick">
        <Icon id="uil:filter"></Icon>
        <OneLineP class="text">
          <b v-if="!isDefaultFilter">{{ filterLabel }}</b>
          <template v-if="isDefaultFilter">{{ filterLabel }}</template>
        </OneLineP>
        <Icon id="uil:angle-down"></Icon>
      </button>
      <button
        class="reset-button"
        title="Reset"
        v-if="showResetButton"
        @click="handleResetClicked"
      >
        <Icon id="uil:redo"></Icon>
      </button>
    </div>
    <div class="dropdowns">
      <div class="time-dropdown-locator">
        <div
          class="time-dropdown-container"
          :class="{ open: openDropdown == 'time' }"
        >
          <div class="bg"></div>
          <TimeControls
            class="content"
            :time="time"
            :is-shown="openDropdown == 'time'"
            @submit="handleTimeSubmit"
          ></TimeControls>
        </div>
      </div>
      <div class="filter-dropdown-locator">
        <div
          class="filter-dropdown-container"
          :class="{ open: openDropdown == 'filter' }"
        >
          <div class="bg"></div>
          <FilterControls
            class="content"
            :stop="stop"
            v-model="filterElect"
            @close-requested="closeDropdown"
          ></FilterControls>
        </div>
      </div>
      <div
        class="dropdown-cover"
        v-if="openDropdown != 'none'"
        @click="closeDropdown"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
.controls {
  // For ".dropdowns".
  position: relative;
}
.dropdowns,
.buttons {
  display: grid;
  max-width: 36rem;
  grid-template-columns: 1fr;
  grid-template-rows: 2.5rem 2.5rem;
  grid-template-areas: "time" "filter";
}
.controls.can-reset .buttons {
  grid-template-columns: 1fr 2.5rem;
  grid-template-areas:
    "time reset"
    "filter reset";
}
.buttons {
  @include utils.raised-surface;
  border-radius: 0.75rem;
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
  justify-content: center;
}
.icon {
  font-size: 1.2rem;
}

.dropdowns {
  // 1px since ".buttons" has a 1px border.
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 0;
  right: 0;

  pointer-events: none;
}
.time-dropdown-locator,
.filter-dropdown-locator {
  position: relative;
}
.time-dropdown-locator {
  grid-area: time;
}
.filter-dropdown-locator {
  grid-area: filter;
}

.time-dropdown-container,
.filter-dropdown-container {
  @include utils.dropdown-setup;

  // Also acts as "position: relative" for the background.
  position: absolute;
  top: 3rem;
  left: 0;
  right: 0;
  pointer-events: all;

  // Needs to be above ".dropdown-cover" (which is 12000).
  z-index: 14000;

  &:not(.open) {
    @include utils.dropdown-closed;
  }

  .bg {
    @include utils.dropdown-bg;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    border-radius: 0.75rem;
  }
  .content {
    z-index: 1;
  }
}

.dropdown-cover {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: all;

  // Needs to be above the navbar (which is 9999).
  z-index: 12000;
}

@media screen and (min-width: 48rem) {
  .buttons,
  .dropdowns {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 2.5rem;
    grid-template-areas: "time filter";
  }
  .time-button {
    border-right: 1px solid var(--color-ink-20);
    border-bottom: none;
  }
  .controls.can-reset .dropdowns,
  .controls.can-reset .buttons {
    grid-template-columns: 1fr 1fr 2.5rem;
    grid-template-areas: "time filter reset";
  }
}
</style>
