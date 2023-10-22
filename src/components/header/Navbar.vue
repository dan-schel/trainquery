<script setup lang="ts">
import { computed } from "vue";
import Wordmark from "../Wordmark.vue";
import SimpleButton from "../common/SimpleButton.vue";
import type { MenuItem } from "./Header.vue";

const props = defineProps<{
  items: MenuItem[];
}>();
defineEmits<{
  (e: "menuButtonClicked"): void;
  (e: "searchButtonClicked"): void;
  (e: "navigation"): void;
}>();

const nonHiddenItems = computed(() =>
  props.items.filter((i) => !(i.hideOnDesktop ?? false)),
);
</script>

<template>
  <nav>
    <div class="bg"></div>
    <div class="content-wrapper">
      <div class="content">
        <SimpleButton
          class="menu-button"
          :content="{ icon: 'uil:bars', altText: 'Menu' }"
          @click="$emit('menuButtonClicked')"
        ></SimpleButton>
        <RouterLink class="app-name-button" :to="{ name: 'home' }">
          <Wordmark></Wordmark>
        </RouterLink>
        <div class="desktop-links">
          <SimpleButton
            v-for="item in nonHiddenItems"
            :key="item.routeName"
            :content="{ icon: item.icon, text: item.title }"
            :to="{ name: item.routeName }"
            @click="() => $emit('navigation')"
          ></SimpleButton>
        </div>
        <div class="spacer"></div>
        <SimpleButton
          class="search-icon-button"
          :content="{ icon: 'uil:search', altText: 'Search' }"
          @click="$emit('searchButtonClicked')"
        ></SimpleButton>
        <SimpleButton
          class="search-full-button"
          :content="{ icon: 'uil:search', text: 'Search' }"
          @click="$emit('searchButtonClicked')"
        ></SimpleButton>
        <SimpleButton
          :content="{ icon: 'uil:setting', altText: 'Settings' }"
          :to="{ name: 'settings' }"
        ></SimpleButton>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;
nav {
  // Allow .bg to position itself.
  position: relative;
  z-index: 2;
}
.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  background-color: var(--color-paper-30);
  @include utils.shadow;
  opacity: 100%;
  transition: opacity 0.25s;
  border-top: 1px solid var(--color-navbar-glint);

  &.blend {
    opacity: 0%;
  }
}
.content-wrapper {
  @include template.page-centerer;
}
.content {
  @include template.row;
  height: 3rem;
  z-index: 1;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.spacer {
  @include template.flex-grow;
}
.app-name-button {
  @include template.button-hover;
  justify-content: center;
  height: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 1.1rem;
}
.desktop-links {
  @include template.row;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

@media screen and (min-width: 48rem) {
  .menu-button {
    @include template.gone;
  }
}
@media screen and (max-width: 47.999rem) {
  .desktop-links {
    @include template.gone;
  }
}

@media screen and (min-width: 22rem) {
  .search-icon-button {
    @include template.gone;
  }
}
@media screen and (max-width: 21.999rem) {
  .search-full-button {
    @include template.gone;
  }
}
</style>
