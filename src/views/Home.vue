<script setup lang="ts"></script>

<template>
  <main>
    <h1>Home page</h1>
    <router-link :to="{ name: 'about' }" class="bacon">
      <p>Button to the About page</p>
    </router-link>
  </main>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
main {
  align-items: center;
  padding: 2rem;
}
h1 {
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-ink-100);
}
.bacon {
  @include template.button-filled;
  @include template.content-text-icon;
  height: 2rem;
  padding: 0rem 1rem;
  p {
    font-stretch: 75%;
  }
}
</style>
