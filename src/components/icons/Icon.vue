<script setup lang="ts">
import UilBars from "./UilBars.vue";
import UilCodeBranch from "./UilCodeBranch.vue";
import UilInfoCircle from "./UilInfoCircle.vue";
import UilMap from "./UilMap.vue";
import UilMapMarker from "./UilMapMarker.vue";
import UilSearch from "./UilSearch.vue";
import UilSetting from "./UilSetting.vue";
import UilSliderHRange from "./UilSliderHRange.vue";

export type IconID =
  | "uil:bars"
  | "uil:code-branch"
  | "uil:info-circle"
  | "uil:map"
  | "uil:map-marker"
  | "uil:search"
  | "uil:setting"
  | "uil:slider-h-range";

defineProps<{
  id: IconID;
}>();
</script>

<template>
  <UilBars v-if="id == 'uil:bars'" class="icon"></UilBars>
  <UilCodeBranch v-if="id == 'uil:code-branch'" class="icon"></UilCodeBranch>
  <UilInfoCircle v-if="id == 'uil:info-circle'" class="icon"></UilInfoCircle>
  <UilMap v-if="id == 'uil:map'" class="icon"></UilMap>
  <UilMapMarker v-if="id == 'uil:map-marker'" class="icon"></UilMapMarker>
  <UilSearch v-if="id == 'uil:search'" class="icon"></UilSearch>
  <UilSetting v-if="id == 'uil:setting'" class="icon"></UilSetting>
  <UilSliderHRange
    v-if="id == 'uil:slider-h-range'"
    class="icon"
  ></UilSliderHRange>
</template>
