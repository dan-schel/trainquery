<script setup lang="ts">
import MajesticonsPin from "./MajesticonsPin.vue";
import MajesticonsPinLine from "./MajesticonsPinLine.vue";
import UilAngleDown from "./UilAngleDown.vue";
import UilAngleLeft from "./UilAngleLeft.vue";
import UilAngleRight from "./UilAngleRight.vue";
import UilAngleUp from "./UilAngleUp.vue";
import UilBars from "./UilBars.vue";
import UilCalendarSlash from "./UilCalendarSlash.vue";
import UilCheck from "./UilCheck.vue";
import UilClock from "./UilClock.vue";
import UilCodeBranch from "./UilCodeBranch.vue";
import UilExclamationCircle from "./UilExclamationCircle.vue";
import UilFilter from "./UilFilter.vue";
import UilInfoCircle from "./UilInfoCircle.vue";
import UilMap from "./UilMap.vue";
import UilMapMarker from "./UilMapMarker.vue";
import UilRedo from "./UilRedo.vue";
import UilSearch from "./UilSearch.vue";
import UilSetting from "./UilSetting.vue";
import UilSliderHRange from "./UilSliderHRange.vue";

export type IconID =
  | "majesticons:pin"
  | "majesticons:pin-line"
  | "uil:angle-down"
  | "uil:angle-left"
  | "uil:angle-right"
  | "uil:angle-up"
  | "uil:bars"
  | "uil:calendar-slash"
  | "uil:check"
  | "uil:clock"
  | "uil:code-branch"
  | "uil:exclamation-circle"
  | "uil:filter"
  | "uil:info-circle"
  | "uil:map"
  | "uil:map-marker"
  | "uil:redo"
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
  <UilAngleDown v-else-if="id == 'uil:angle-down'" class="icon"></UilAngleDown>
  <UilAngleLeft v-else-if="id == 'uil:angle-left'" class="icon"></UilAngleLeft>
  <UilAngleRight
    v-else-if="id == 'uil:angle-right'"
    class="icon"
  ></UilAngleRight>
  <UilAngleUp v-else-if="id == 'uil:angle-up'" class="icon"></UilAngleUp>
  <UilBars v-else-if="id == 'uil:bars'" class="icon"></UilBars>
  <UilCalendarSlash
    v-else-if="id == 'uil:calendar-slash'"
    class="icon"
  ></UilCalendarSlash>
  <UilCheck v-else-if="id == 'uil:check'" class="icon"></UilCheck>
  <UilClock v-else-if="id == 'uil:clock'" class="icon"></UilClock>
  <UilCodeBranch
    v-else-if="id == 'uil:code-branch'"
    class="icon"
  ></UilCodeBranch>
  <UilExclamationCircle
    v-else-if="id == 'uil:exclamation-circle'"
    class="icon"
  ></UilExclamationCircle>
  <UilFilter v-else-if="id == 'uil:filter'" class="icon"></UilFilter>
  <UilInfoCircle
    v-else-if="id == 'uil:info-circle'"
    class="icon"
  ></UilInfoCircle>
  <UilMap v-else-if="id == 'uil:map'" class="icon"></UilMap>
  <UilMapMarker v-else-if="id == 'uil:map-marker'" class="icon"></UilMapMarker>
  <UilRedo v-else-if="id == 'uil:redo'" class="icon"></UilRedo>
  <UilSearch v-else-if="id == 'uil:search'" class="icon"></UilSearch>
  <UilSetting v-else-if="id == 'uil:setting'" class="icon"></UilSetting>
  <UilSliderHRange
    v-else-if="id == 'uil:slider-h-range'"
    class="icon"
  ></UilSliderHRange>
</template>
