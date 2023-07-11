<script setup lang="ts">
import Wordmark from "../Wordmark.vue";
import SimpleButton from "../common/SimpleButton.vue";
</script>

<template>
  <nav>
    <div class="bg"></div>
    <div class="content-wrapper">
      <div class="content">
        <SimpleButton
          class="menu-button"
          :content="{ icon: 'uil:bars', altText: 'Menu' }"
        ></SimpleButton>
        <RouterLink class="app-name-button" :to="{ name: 'home' }">
          <Wordmark></Wordmark>
        </RouterLink>
        <div class="desktop-links">
          <SimpleButton
            :content="{ icon: 'uil:map', text: 'Train map' }"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:code-branch', text: 'Lines' }"
          ></SimpleButton>
          <SimpleButton
            :content="{ icon: 'uil:info-circle', text: 'About' }"
            :to="{ name: 'about' }"
          ></SimpleButton>
        </div>
        <div class="spacer"></div>
        <SimpleButton
          class="search-icon-button"
          :content="{ icon: 'uil:search', altText: 'Search' }"
        ></SimpleButton>
        <SimpleButton
          class="search-full-button"
          :content="{ icon: 'uil:search', text: 'Search' }"
        ></SimpleButton>
        <SimpleButton
          :content="{ icon: 'uil:setting', altText: 'Settings' }"
        ></SimpleButton>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
nav {
  // Allow .bg to position itself.
  position: relative;
  z-index: 1;
}
.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  background-color: var(--color-paper-30);
  box-shadow: 0px 2px 4px var(--color-shadow-10);
  opacity: 100%;
  transition: opacity 0.25s;

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

@media screen and (min-width: 24rem) {
  .search-icon-button {
    @include template.gone;
  }
}
@media screen and (max-width: 23.999rem) {
  .search-full-button {
    @include template.gone;
  }
}
</style>
