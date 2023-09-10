<script setup lang="ts">
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import Icon from "@/components/icons/Icon.vue";
import { useHead } from "@vueuse/head";
import BigSearch from "@/components/BigSearch.vue";
import Wordmark from "@/components/Wordmark.vue";
import { getConfig } from "@/utils/get-config";
useHead({
  title: "Home",
});
</script>

<template>
  <main>
    <div>
      <div class="spacer"></div>
      <div class="hero">
        <Wordmark class="wordmark"></Wordmark>
        <p class="tagline">{{ getConfig().frontend.tagline }}</p>
        <BigSearch class="big-search"></BigSearch>
      </div>
      <div class="spacer"></div>
      <div class="pinned-widgets">
        <div class="section-title">
          <Icon id="majesticons:pin-line"></Icon>
          <p>Pinned widgets</p>
        </div>
        <DepartureGroup :allow-pinning="false" :feed-count="2"></DepartureGroup>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  @include template.page-centerer;
}
.hero {
  align-items: center;
  padding: 0rem 1rem;
}
.wordmark {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.tagline {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
}
.big-search {
  width: 100%;
  max-width: 36rem;
}
.pinned-widgets {
  margin-bottom: 2rem;
  padding: 0rem 1rem;
}
.section-title {
  @include template.row;
  gap: 0.5rem;
  align-self: center;
  margin-bottom: 1rem;
  p {
    font-weight: bold;
    color: var(--color-ink-100);
    font-size: 1rem;
  }
  .icon {
    font-size: 1.2rem;
  }
}
.spacer {
  min-height: 5rem;
  flex-grow: 1;
}
</style>
