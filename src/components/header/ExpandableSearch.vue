<script setup lang="ts">
import Icon from "../icons/Icon.vue";
import SearchResult from "./SearchResult.vue";
</script>

<template>
  <form autocomplete="off">
    <Icon id="uil:search"></Icon>
    <input type="search" placeholder="Search stops, lines, or pages" />
  </form>
  <div class="divider"></div>
  <div class="results">
    <SearchResult
      icon="uil:map-marker"
      title="Berwick Station"
      subtitle="Gippsland and Pakenham lines"
    ></SearchResult>
    <SearchResult icon="uil:info-circle" title="About"></SearchResult>
    <SearchResult
      icon="uil:slider-h-range"
      title="Sunbury Line"
      subtitle="Suburban train line"
    ></SearchResult>
  </div>
</template>

<style scoped lang="scss">
form {
  position: relative;

  .icon {
    color: var(--color-ink-50);
    position: absolute;
    left: 1.6rem;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
}
input {
  height: 3rem;
  padding-left: 3rem;
  padding-right: 1rem;
}
.divider {
  margin-left: 1rem;
  margin-right: 1rem;
  height: 1px;
  border-top: 1px solid var(--color-ink-10);
}
#navbar-expandable-search-results {
  max-height: min(60vh, 20rem);
  overflow-y: scroll;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
