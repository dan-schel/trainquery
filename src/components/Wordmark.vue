<script setup lang="ts">
import Logo from "./Logo.vue";
import { ref } from "vue";
import { getConfig } from "@/cached-config";

const appName = ref(getConfig().frontend.appName);
</script>

<template>
  <div class="wordmark">
    <Logo class="logo"></Logo>
    <div class="text">
      <p class="main">{{ appName }}</p>
      <p class="beta">BETA</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
.wordmark {
  @include template.row;
}
.logo {
  font-size: 1em;
}
.text {
  flex-direction: row;
  align-items: baseline;
}
.main {
  @include template.no-select;
  font-size: 1em;
  font-weight: 700;
  color: var(--color-ink-100);
  margin-left: 0.4em;
}
.beta {
  @include template.no-select;
  font-size: 0.5em;
  font-weight: 700;
  font-style: italic;
  margin-left: 0.1em;
}
</style>
