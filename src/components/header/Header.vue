<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import ExpandableMenu from "./ExpandableMenu.vue";
import ExpandableSearch from "./ExpandableSearch.vue";
import Navbar from "./Navbar.vue";
import type { IconID } from "../icons/Icon.vue";
import { useRoute } from "vue-router";

export type MenuItem = {
  icon: IconID;
  title: string;
  routeName: string;
};

const menuItems = ref<MenuItem[]>([
  { icon: "uil:map", title: "Train map", routeName: "map" },
  { icon: "uil:code-branch", title: "Lines", routeName: "lines" },
  { icon: "uil:info-circle", title: "About", routeName: "about" },
]);

const openExpandable = ref<"none" | "menu" | "search">("none");
function menuButtonClicked() {
  openExpandable.value = openExpandable.value == "menu" ? "none" : "menu";
}
function searchButtonClicked() {
  openExpandable.value = openExpandable.value == "search" ? "none" : "search";
}

// Close any open expandables when the route changes.
const route = useRoute();
watch(route, () => {
  openExpandable.value = "none";
});

const headerRef = ref<HTMLElement>();
const handleOutsideClick = (e: MouseEvent) => {
  if (headerRef.value == null || openExpandable.value == "none") {
    return;
  }
  const target = e.target as HTMLElement;
  if (!headerRef.value.contains(target)) {
    openExpandable.value = "none";

    // This doesn't work for RouterLinks unfortunately, a transparent div might
    // be needed at some point :/
    e.preventDefault();
  }
};
const handleEscKey = (e: KeyboardEvent) => {
  if (e.code == "KeyK" && e.ctrlKey) {
    openExpandable.value = "search";
    e.preventDefault();
  }
  if (e.code == "Escape") {
    openExpandable.value = "none";
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
  <header ref="headerRef">
    <Navbar
      :items="menuItems"
      @menu-button-clicked="menuButtonClicked"
      @search-button-clicked="searchButtonClicked"
    ></Navbar>
    <div class="expandables">
      <div
        class="expandable-container"
        :class="{ open: openExpandable == 'menu' }"
      >
        <ExpandableMenu :items="menuItems"></ExpandableMenu>
      </div>
      <div
        class="expandable-container"
        :class="{ open: openExpandable == 'search' }"
      >
        <div class="expandable">
          <ExpandableSearch
            :open="openExpandable == 'search'"
          ></ExpandableSearch>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-width: var(--min-page-width);
  z-index: 9999;
}
.expandables {
  position: relative;
  z-index: 0;
}
.expandable-container {
  @include template.page-centerer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  background-color: var(--color-paper-20);
  @include utils.shadow;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;

  overflow: hidden;

  // "backdrop-filter: blur(0.25rem);" would be nice, but it doesn't seem to work
  // (because it's relatively positioned?).
  opacity: 95%;

  &:not(.open) {
    transform: translateY(-2rem);
    opacity: 0%;
    visibility: hidden;
    pointer-events: none;
  }
}
</style>
