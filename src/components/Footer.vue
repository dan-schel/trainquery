<script setup lang="ts">
import Wordmark from "./Wordmark.vue";
import { getConfig } from "@/cached-config";
</script>

<template>
  <footer>
    <div class="content">
      <div class="divider"></div>
      <Wordmark class="wordmark"></Wordmark>
      <p class="disclaimer" v-html="getConfig().frontend.footer"></p>
      <p>
        <RouterLink :to="{ name: 'about' }" class="link">
          About {{ getConfig().frontend.appName }}
        </RouterLink>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
footer {
  @include template.page-centerer;
}
.content {
  padding: 1.5rem 1rem;

  // For .divider positioning.
  position: relative;
}
.divider {
  position: absolute;
  top: 0;
  left: 1rem;
  right: 1rem;
  border-top: 1px solid var(--color-ink-20);
}
.wordmark {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
p {
  font-size: 0.75rem;
}
.disclaimer {
  font-stretch: 85%;
}
p:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
