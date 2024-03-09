<script setup lang="ts">
import { useSettings } from "@/settings/settings";
import { formatFilter } from "@/utils/format-filter";
import { getConfig } from "@/utils/get-config";
import { requireStop } from "shared/system/config-utils";
import { computed } from "vue";
import LoadingSpinner from "../common/LoadingSpinner.vue";
import OneLineP from "../common/OneLineP.vue";
import SimpleButton from "../common/SimpleButton.vue";
import {
  PinnedWidget,
  maxPinnedWidgets,
  moveWidgetDown,
  moveWidgetUp,
  unpinWidget,
} from "@/settings/pinned-widgets";

const { settings, updateSettings } = useSettings();

const pinnedWidgets = computed(() => {
  if (settings.value == null) {
    return null;
  }
  const pinnedWidgets = settings.value.pinnedWidgets;
  return pinnedWidgets.map((w, i) => ({
    widget: w,
    id: `${w.stop.toFixed()} ${w.filter.asString()}`,
    stopName: requireStop(getConfig(), w.stop).name,
    filterString: formatFilter(w.filter, w.stop),
    isAtTop: i === 0,
    isAtBottom: i === pinnedWidgets.length - 1,
  }));
});

function handleUnpin(widget: PinnedWidget) {
  if (settings.value != null) {
    updateSettings(unpinWidget(settings.value, widget));
  }
}
function handleMoveUp(widget: PinnedWidget) {
  if (settings.value != null) {
    updateSettings(moveWidgetUp(settings.value, widget));
  }
}
function handleMoveDown(widget: PinnedWidget) {
  if (settings.value != null) {
    updateSettings(moveWidgetDown(settings.value, widget));
  }
}
</script>

<template>
  <div class="widgets">
    <LoadingSpinner class="loading" v-if="pinnedWidgets == null" />
    <p class="status" v-else-if="pinnedWidgets.length == 0">
      No pinned widgets. Click the pin button above a widget on a stop's page to
      show it on the homepage.
    </p>
    <template v-else>
      <div class="widget" v-for="widget in pinnedWidgets" :key="widget.id">
        <OneLineP class="text">
          <span class="stop-name">{{ widget.stopName }}</span
          >&ensp;•&ensp;{{ widget.filterString }}
        </OneLineP>
        <SimpleButton
          class="control"
          :content="{
            icon: 'uil:angle-up',
            altText: 'Move higher',
          }"
          @click="() => handleMoveUp(widget.widget)"
          :disabled="widget.isAtTop"
        ></SimpleButton>
        <SimpleButton
          class="control"
          :content="{
            icon: 'uil:angle-down',
            altText: 'Move lower',
          }"
          @click="() => handleMoveDown(widget.widget)"
          :disabled="widget.isAtBottom"
        ></SimpleButton>
        <SimpleButton
          class="control"
          :content="{
            icon: 'uil:trash-alt',
            altText: 'Unpin widget',
          }"
          @click="() => handleUnpin(widget.widget)"
        ></SimpleButton>
      </div>
      <div class="divider"></div>
      <p class="status">
        {{
          pinnedWidgets.length >= maxPinnedWidgets
            ? `You've reached the limit of ${maxPinnedWidgets.toFixed()} pinned widgets.`
            : "Pin more widgets by clicking the pin button above a widget on a stop's page."
        }}
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.widgets {
  @include utils.raised-surface;
  padding: 0.5rem;
  border-radius: 0.75rem;
}
.widget {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  .text {
    min-width: 0;
  }
}
.loading {
  align-self: center;
}
.stop-name {
  font-weight: bold;
  color: var(--color-ink-100);
  margin-left: 0.5rem;
}
.status {
  margin: 0.5rem;
  font-style: italic;
}
.divider {
  margin: 0.5rem;
  border-bottom: 1px solid var(--color-ink-20);
}
</style>
