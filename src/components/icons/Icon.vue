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
import UilExternalLinkAlt from "./UilExternalLinkAlt.vue";
import UilFilter from "./UilFilter.vue";
import UilGithub from "./UilGithub.vue";
import UilHome from "./UilHome.vue";
import UilInfoCircle from "./UilInfoCircle.vue";
import UilMap from "./UilMap.vue";
import UilMapMarker from "./UilMapMarker.vue";
import UilRedo from "./UilRedo.vue";
import UilSearch from "./UilSearch.vue";
import UilSetting from "./UilSetting.vue";
import UilSliderHRange from "./UilSliderHRange.vue";
import UilTimes from "./UilTimes.vue";
import UilTrashAlt from "./UilTrashAlt.vue";
import UilWrench from "./UilWrench.vue";

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
  | "uil:external-link-alt"
  | "uil:filter"
  | "uil:github"
  | "uil:home"
  | "uil:info-circle"
  | "uil:map"
  | "uil:map-marker"
  | "uil:redo"
  | "uil:search"
  | "uil:setting"
  | "uil:slider-h-range"
  | "uil:times"
  | "uil:trash-alt"
  | "uil:wrench";

defineProps<{
  id: IconID;
}>();
</script>

<template>
  <MajesticonsPin v-if="id === 'majesticons:pin'" class="icon"></MajesticonsPin>
  <MajesticonsPinLine
    v-else-if="id === 'majesticons:pin-line'"
    class="icon"
  ></MajesticonsPinLine>
  <UilAngleDown v-else-if="id === 'uil:angle-down'" class="icon"></UilAngleDown>
  <UilAngleLeft v-else-if="id === 'uil:angle-left'" class="icon"></UilAngleLeft>
  <UilAngleRight
    v-else-if="id === 'uil:angle-right'"
    class="icon"
  ></UilAngleRight>
  <UilAngleUp v-else-if="id === 'uil:angle-up'" class="icon"></UilAngleUp>
  <UilBars v-else-if="id === 'uil:bars'" class="icon"></UilBars>
  <UilCalendarSlash
    v-else-if="id === 'uil:calendar-slash'"
    class="icon"
  ></UilCalendarSlash>
  <UilCheck v-else-if="id === 'uil:check'" class="icon"></UilCheck>
  <UilClock v-else-if="id === 'uil:clock'" class="icon"></UilClock>
  <UilCodeBranch
    v-else-if="id === 'uil:code-branch'"
    class="icon"
  ></UilCodeBranch>
  <UilExclamationCircle
    v-else-if="id === 'uil:exclamation-circle'"
    class="icon"
  ></UilExclamationCircle>
  <UilExternalLinkAlt
    v-else-if="id === 'uil:external-link-alt'"
    class="icon"
  ></UilExternalLinkAlt>
  <UilFilter v-else-if="id === 'uil:filter'" class="icon"></UilFilter>
  <UilGithub v-else-if="id === 'uil:github'" class="icon"></UilGithub>
  <UilHome v-else-if="id === 'uil:home'" class="icon"></UilHome>
  <UilInfoCircle
    v-else-if="id === 'uil:info-circle'"
    class="icon"
  ></UilInfoCircle>
  <UilMap v-else-if="id === 'uil:map'" class="icon"></UilMap>
  <UilMapMarker v-else-if="id === 'uil:map-marker'" class="icon"></UilMapMarker>
  <UilRedo v-else-if="id === 'uil:redo'" class="icon"></UilRedo>
  <UilSearch v-else-if="id === 'uil:search'" class="icon"></UilSearch>
  <UilSetting v-else-if="id === 'uil:setting'" class="icon"></UilSetting>
  <UilSliderHRange
    v-else-if="id === 'uil:slider-h-range'"
    class="icon"
  ></UilSliderHRange>
  <UilTimes v-else-if="id === 'uil:times'" class="icon"></UilTimes>
  <UilTrashAlt v-else-if="id === 'uil:trash-alt'" class="icon"></UilTrashAlt>
  <UilWrench v-else-if="id === 'uil:wrench'" class="icon"></UilWrench>
</template>
