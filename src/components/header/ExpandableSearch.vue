<script setup lang="ts">
import { ref, watch } from "vue";
import SearchResults from "./SearchResults.vue";
import { useRouter } from "vue-router";
import UilSearch from "../icons/UilSearch.vue";

const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits<{
  (e: "navigation"): void;
}>();

const query = ref("");
const input = ref<HTMLInputElement | null>(null);

watch(
  () => props.open,
  (value: boolean) => {
    if (value) {
      query.value = "";

      // Doesn't work without the delay for some reason :/
      setTimeout(() => input.value?.focus(), 100);
    }
  },
);

const router = useRouter();
const topResultUrl = ref<string | null>(null);

const onSearchEnter = (e: Event) => {
  e.preventDefault();
  if (topResultUrl.value != null) {
    router.push(topResultUrl.value);
    emit("navigation");
  }
};
</script>

<template>
  <form autocomplete="off" @submit="onSearchEnter">
    <UilSearch></UilSearch>
    <input
      type="search"
      placeholder="Search stops, lines, or pages"
      v-model="query"
      ref="input"
    />
  </form>
  <div class="divider"></div>
  <SearchResults
    class="results"
    :query="query"
    mode="all"
    @top-result-change="(e) => (topResultUrl = e.url)"
    @result-click="() => $emit('navigation')"
  ></SearchResults>
</template>

<style scoped lang="scss">
form {
  position: relative;

  svg {
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
.results {
  max-height: min(60vh, 20rem);
  overflow-y: scroll;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
