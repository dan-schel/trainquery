<script setup lang="ts">
import MajesticonsPin from "./MajesticonsPin.vue";
import MajesticonsPinLine from "./MajesticonsPinLine.vue";
import MaterialSymbolsCallMergeRounded from "./MaterialSymbolsCallMergeRounded.vue";
import UilAlignLeft from "./UilAlignLeft.vue";
import UilAngleDown from "./UilAngleDown.vue";
import UilAngleLeft from "./UilAngleLeft.vue";
import UilAngleRight from "./UilAngleRight.vue";
import UilAngleUp from "./UilAngleUp.vue";
import UilBan from "./UilBan.vue";
import UilBars from "./UilBars.vue";
import UilCalendar from "./UilCalendar.vue";
import UilCalendarSlash from "./UilCalendarSlash.vue";
import UilCheck from "./UilCheck.vue";
import UilCheckCircle from "./UilCheckCircle.vue";
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
import UilPaperclip from "./UilPaperclip.vue";
import UilPlus from "./UilPlus.vue";
import UilRedo from "./UilRedo.vue";
import UilSearch from "./UilSearch.vue";
import UilSetting from "./UilSetting.vue";
import UilSliderHRange from "./UilSliderHRange.vue";
import UilStar from "./UilStar.vue";
import UilStethoscopeAlt from "./UilStethoscopeAlt.vue";
import UilTimes from "./UilTimes.vue";
import UilTimesCircle from "./UilTimesCircle.vue";
import UilTrashAlt from "./UilTrashAlt.vue";
import UilUser from "./UilUser.vue";
import UilWrench from "./UilWrench.vue";

const Icons = {
  "majesticons:pin": MajesticonsPin,
  "majesticons:pin-line": MajesticonsPinLine,
  "material-symbols:call-merge-rounded": MaterialSymbolsCallMergeRounded,
  "uil:align-left": UilAlignLeft,
  "uil:angle-down": UilAngleDown,
  "uil:angle-left": UilAngleLeft,
  "uil:angle-right": UilAngleRight,
  "uil:angle-up": UilAngleUp,
  "uil:ban": UilBan,
  "uil:bars": UilBars,
  "uil:calendar": UilCalendar,
  "uil:calendar-slash": UilCalendarSlash,
  "uil:check": UilCheck,
  "uil:check-circle": UilCheckCircle,
  "uil:clock": UilClock,
  "uil:code-branch": UilCodeBranch,
  "uil:exclamation-circle": UilExclamationCircle,
  "uil:external-link-alt": UilExternalLinkAlt,
  "uil:filter": UilFilter,
  "uil:github": UilGithub,
  "uil:home": UilHome,
  "uil:info-circle": UilInfoCircle,
  "uil:map": UilMap,
  "uil:map-marker": UilMapMarker,
  "uil:paperclip": UilPaperclip,
  "uil:plus": UilPlus,
  "uil:redo": UilRedo,
  "uil:search": UilSearch,
  "uil:setting": UilSetting,
  "uil:slider-h-range": UilSliderHRange,
  "uil:star": UilStar,
  "uil:stethoscope-alt": UilStethoscopeAlt,
  "uil:times": UilTimes,
  "uil:times-circle": UilTimesCircle,
  "uil:trash-alt": UilTrashAlt,
  "uil:user": UilUser,
  "uil:wrench": UilWrench,
};

export type IconID = keyof typeof Icons;

defineProps<{
  id: IconID;
}>();
</script>

<template>
  <component :is="Icons[id]"></component>
</template>
