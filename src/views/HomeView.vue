<script setup lang="ts"></script>

<template>
  <main>
    <a href="/about" class="bacon"><p>HomeView</p></a>
  </main>
</template>

<style lang="scss" scoped>
@use "@/assets/css-template/import" as template;
.bacon {
  @include template.button-filled;
}
</style>
