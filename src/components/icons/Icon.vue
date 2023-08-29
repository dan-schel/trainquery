<script setup lang="ts">
import MajesticonsPin from "./MajesticonsPin.vue";
import MajesticonsPinLine from "./MajesticonsPinLine.vue";
import UilAngleLeft from "./UilAngleLeft.vue";
import UilAngleRight from "./UilAngleRight.vue";
import UilBars from "./UilBars.vue";
import UilCodeBranch from "./UilCodeBranch.vue";
import UilExclamationCircle from "./UilExclamationCircle.vue";
import UilInfoCircle from "./UilInfoCircle.vue";
import UilMap from "./UilMap.vue";
import UilMapMarker from "./UilMapMarker.vue";
import UilSearch from "./UilSearch.vue";
import UilSetting from "./UilSetting.vue";
import UilSliderHRange from "./UilSliderHRange.vue";

export type IconID =
  | "majesticons:pin"
  | "majesticons:pin-line"
  | "uil:angle-left"
  | "uil:angle-right"
  | "uil:bars"
  | "uil:code-branch"
  | "uil:exclamation-circle"
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
  <MajesticonsPin v-if="id == 'majesticons:pin'" class="icon"></MajesticonsPin>
  <MajesticonsPinLine
    v-else-if="id == 'majesticons:pin-line'"
    class="icon"
  ></MajesticonsPinLine>
  <UilAngleLeft v-else-if="id == 'uil:angle-left'" class="icon"></UilAngleLeft>
  <UilAngleRight
    v-else-if="id == 'uil:angle-right'"
    class="icon"
  ></UilAngleRight>
  <UilBars v-else-if="id == 'uil:bars'" class="icon"></UilBars>
  <UilCodeBranch
    v-else-if="id == 'uil:code-branch'"
    class="icon"
  ></UilCodeBranch>
  <UilExclamationCircle
    v-else-if="id == 'uil:exclamation-circle'"
    class="icon"
  ></UilExclamationCircle>
  <UilInfoCircle
    v-else-if="id == 'uil:info-circle'"
    class="icon"
  ></UilInfoCircle>
  <UilMap v-else-if="id == 'uil:map'" class="icon"></UilMap>
  <UilMapMarker v-else-if="id == 'uil:map-marker'" class="icon"></UilMapMarker>
  <UilSearch v-else-if="id == 'uil:search'" class="icon"></UilSearch>
  <UilSetting v-else-if="id == 'uil:setting'" class="icon"></UilSetting>
  <UilSliderHRange
    v-else-if="id == 'uil:slider-h-range'"
    class="icon"
  ></UilSliderHRange>
</template>
