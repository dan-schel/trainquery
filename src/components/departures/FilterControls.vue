<script setup lang="ts">
import type { DepartureFilter } from "shared/system/timetable/departure-filter";
import SimpleButton from "../common/SimpleButton.vue";
import Switch from "../common/Switch.vue";
import {
  isFilterSelected,
  toggleFilter,
  getAvailableFilters,
} from "./helpers/available-filters";
import { computed } from "vue";
import type { StopID } from "shared/system/ids";

const props = defineProps<{
  stop: StopID;
  modelValue: DepartureFilter;
}>();

defineEmits<{
  (e: "update:modelValue", newValue: DepartureFilter): void;
  (e: "closeRequested"): void;
}>();

const availableFilters = computed(() => getAvailableFilters(props.stop));
const arrivals = computed(() => props.modelValue.arrivals);
const setDownOnly = computed(() => props.modelValue.setDownOnly);
const noAvailableFilters =
  availableFilters.value.lines == null &&
  availableFilters.value.directions == null &&
  availableFilters.value.platforms == null;
</script>

<template>
  <div class="filter-controls">
    <h5>Filter trains</h5>
    <div class="scrollable">
      <h6 v-if="availableFilters.lines != null">By line</h6>
      <div class="filter-row" v-if="availableFilters.lines != null">
        <button
          class="filter-button"
          v-for="filter in availableFilters.lines"
          :class="{
            selected: isFilterSelected(filter, modelValue),
          }"
          @click="
            $emit(
              'update:modelValue',
              toggleFilter(filter, modelValue, availableFilters),
            )
          "
          :key="filter.line"
        >
          <p>{{ filter.displayName }}</p>
        </button>
      </div>
      <h6 v-if="availableFilters.directions != null">By direction</h6>
      <div class="filter-row" v-if="availableFilters.directions != null">
        <button
          class="filter-button"
          v-for="filter in availableFilters.directions"
          :class="{
            selected: isFilterSelected(filter, modelValue),
          }"
          @click="
            $emit(
              'update:modelValue',
              toggleFilter(filter, modelValue, availableFilters),
            )
          "
          :key="filter.direction"
        >
          <p>{{ filter.displayName }}</p>
        </button>
      </div>
      <h6 v-if="availableFilters.platforms != null">By platform</h6>
      <div class="filter-row" v-if="availableFilters.platforms != null">
        <button
          class="filter-button platform"
          v-for="filter in availableFilters.platforms"
          :class="{
            selected: isFilterSelected(filter, modelValue),
          }"
          @click="
            $emit(
              'update:modelValue',
              toggleFilter(filter, modelValue, availableFilters),
            )
          "
          :key="filter.platform"
        >
          <p>{{ filter.displayName }}</p>
        </button>
      </div>
      <p class="empty" v-if="noAvailableFilters">
        No filtering options available.
      </p>
    </div>
    <Switch
      class="switch"
      :model-value="arrivals"
      @update:model-value="
        $emit('update:modelValue', modelValue.with({ arrivals: $event }))
      "
      ><p>Show arrivals</p></Switch
    >
    <Switch
      class="switch"
      :model-value="setDownOnly"
      @update:model-value="
        $emit('update:modelValue', modelValue.with({ setDownOnly: $event }))
      "
      ><p>Show set down only trains</p></Switch
    >
    <SimpleButton
      class="submit"
      :content="{ icon: 'uil:check', text: 'Set' }"
      layout="traditional-wide"
      theme="filled"
      @click="$emit('closeRequested')"
    ></SimpleButton>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.filter-controls {
  padding: 1rem;
  display: grid;
  grid-template-rows: auto 1fr auto auto auto;
  row-gap: 0.5rem;
}
h5,
h6 {
  font-weight: bold;
  color: var(--color-ink-100);
}
h5 {
  font-size: 1rem;
}
.scrollable {
  border-top: 1px solid var(--color-ink-20);
  border-bottom: 1px solid var(--color-ink-20);
  padding-top: 1rem;
  max-height: 20rem;
  overflow-y: scroll;
  margin-bottom: 0.5rem;
}
h6 {
  margin-bottom: 0.5rem;
}
.filter-row {
  @include template.row;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
.filter-button {
  @include template.row;
  @include template.content-text;
  height: 1.5rem;
  padding: 0 0.5rem;
  --button-rounding: 0.75rem;
  p {
    font-size: 0.8rem;
  }

  &.platform {
    height: 2rem;
    min-width: 2.25rem;
    padding: 0 0.75rem;
    justify-content: center;
    p {
      font-size: 1rem;
    }
  }

  &:not(.selected) {
    @include template.button-filled-neutral;
  }
  &.selected {
    @include template.button-filled;
  }
}
.switch p {
  margin-left: 1rem;
}
.submit {
  justify-self: flex-end;
}
.empty {
  font-style: italic;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
}
</style>
