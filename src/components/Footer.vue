<script setup lang="ts">
import { parseInlineMarkdown } from "@/utils/parse-markdown";
import { getConfig } from "@/utils/get-config";

const disclaimerHtml = parseInlineMarkdown(getConfig().frontend.footerMarkdown);
</script>

<template>
  <footer>
    <div class="content">
      <div class="divider"></div>
      <p class="disclaimer" v-html="disclaimerHtml"></p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
footer {
  @include template.page-centerer;
}
.content {
  padding: 1rem 1rem;

  // For .divider positioning.
  position: relative;
}
.divider {
  position: absolute;
  top: 0;
  left: 1rem;
  right: 1rem;
  border-top: 1px solid var(--color-soft-border);
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
