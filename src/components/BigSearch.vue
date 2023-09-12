<script setup lang="ts">
import { ref } from "vue";
import Icon from "@/components/icons/Icon.vue";
import SearchResults from "@/components/header/SearchResults.vue";
import { useRouter } from "vue-router";

const query = ref("");
const router = useRouter();
const topResultUrl = ref<string | null>(null);

const onSearchEnter = (e: Event) => {
  e.preventDefault();
  if (topResultUrl.value != null) {
    router.push(topResultUrl.value);
  }
};
</script>

<template>
  <div class="big-search">
    <form autocomplete="off" @submit="onSearchEnter">
      <Icon id="uil:search"></Icon>
      <input
        type="search"
        placeholder="Search stops, lines, or pages"
        v-model="query"
        ref="input"
      />
    </form>

    <!-- Tab index 0 here makes focus-within work correctly for iOS Safari (shrug) -->
    <div class="results-container" tabindex="0">
      <div class="results-bg"></div>
      <SearchResults
        class="results"
        :query="query"
        mode="all"
        @top-result-change="(e) => (topResultUrl = e.url)"
      ></SearchResults>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

.big-search {
  // For the "floating" results dropdown.
  position: relative;

  &:focus-within {
    form {
      background-color: var(--color-paper-30);
      border-color: var(--color-ink-20);
    }
  }
  &:not(:focus-within) {
    .results-container {
      @include utils.dropdown-closed;
    }
  }
}
form {
  @include utils.raised-surface;

  &:hover {
    border-color: var(--color-ink-20);
  }

  // For the search icon.
  position: relative;

  border-radius: 0.75rem;
  transition: background-color 0.1s, border-color 0.1s;

  .icon {
    color: var(--color-ink-50);
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.2rem;
    pointer-events: none;
  }
  input {
    height: 3.5rem;
    padding-left: 3rem;
    padding-right: 1rem;
    font-size: 1.2rem;
  }
}
.results-container {
  @include utils.dropdown-setup;

  // Also acts as "position: relative" for the background.
  position: absolute;
  top: 4rem;
  max-height: 20rem;
  left: 0;
  right: 0;
  z-index: 10;
}
.results-bg {
  @include utils.dropdown-bg;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  border-radius: 0.75rem;
}
.results {
  z-index: 2;
  flex-shrink: 1;
  min-height: 0;
  border-radius: 0.75rem;
  overflow-y: scroll;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin: 1px;
}
</style>
