<script setup lang="ts">
import DepartureGroup from "@/components/departures/DepartureGroup.vue";
import Icon from "@/components/icons/Icon.vue";
import { useHead } from "@vueuse/head";
useHead({
  title: "Home",
});
</script>

<template>
  <main>
    <div>
      <div class="pinned-widgets">
        <div class="section-title">
          <Icon id="majesticons:pin-line"></Icon>
          <p>Pinned widgets</p>
        </div>
        <DepartureGroup :allow-pinning="false" :count="2"></DepartureGroup>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  @include template.page-centerer;
}
.pinned-widgets {
  margin-top: 20rem;
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
</style>
