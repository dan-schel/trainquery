<script setup lang="ts">
import Wordmark from "./Wordmark.vue";
</script>

<template>
  <footer>
    <div class="content">
      <div class="divider"></div>
      <Wordmark class="wordmark"></Wordmark>
      <p class="disclaimer">
        © Dan Schellekens 2023 &mdash; Not affiliated with PTV, Metro Trains
        Melbourne, or V/Line. Data accuracy cannot be guaranteed. For official
        timetables visit
        <a href="https://www.ptv.vic.gov.au" class="link">ptv.vic.gov.au</a>.
      </p>
      <p>
        <RouterLink :to="{ name: 'about' }" class="link">
          About TrainQuery
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
  font-stretch: 75%;
}
p:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
