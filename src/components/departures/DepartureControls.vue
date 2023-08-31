<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import OneLineP from "../common/OneLineP.vue";
import Icon from "../icons/Icon.vue";

const resetButton = false;

const openDropdown = ref<"none" | "time" | "filter">("none");

const handleTimeButtonClick = () => {
  openDropdown.value = openDropdown.value == "time" ? "none" : "time";
};
const handleFilterButtonClick = () => {
  openDropdown.value = openDropdown.value == "filter" ? "none" : "filter";
};

const controlsRef = ref<HTMLElement>();
const handleOutsideClick = (e: MouseEvent) => {
  if (controlsRef.value == null || openDropdown.value == "none") {
    return;
  }
  const target = e.target as HTMLElement;
  if (!controlsRef.value.contains(target)) {
    openDropdown.value = "none";

    // This doesn't work for RouterLinks unfortunately, a transparent div might
    // be needed at some point :/
    e.preventDefault();
  }
};
const handleEscKey = (e: KeyboardEvent) => {
  if (e.code == "Escape") {
    openDropdown.value = "none";
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscKey);
  window.addEventListener("click", handleOutsideClick);
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
  window.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <div class="controls" :class="{ 'can-reset': resetButton }" ref="controlsRef">
    <div class="buttons">
      <button class="time-button" @click="handleTimeButtonClick">
        <Icon id="uil:clock" title="Time"></Icon>
        <OneLineP class="text">Now</OneLineP>
        <Icon id="uil:angle-down"></Icon>
      </button>
      <button class="filter-button" @click="handleFilterButtonClick">
        <Icon id="uil:filter"></Icon>
        <OneLineP class="text"><b>Citybound Gippsland trains</b></OneLineP>
        <Icon id="uil:angle-down"></Icon>
      </button>
      <button class="reset-button" title="Reset" v-if="resetButton">
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
          <div class="content">
            <p>Hello.</p>
          </div>
        </div>
      </div>
      <div class="filter-dropdown-locator">
        <div
          class="filter-dropdown-container"
          :class="{ open: openDropdown == 'filter' }"
        >
          <div class="bg"></div>
          <div class="content">
            <p>Hello.</p>
          </div>
        </div>
      </div>
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
  border-radius: 0.5rem;
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
  z-index: 99;
  pointer-events: all;

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
    padding: 2rem 1rem;
    z-index: 1;
  }
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
