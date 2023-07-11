<script setup lang="ts">
import Navbar from "./Navbar.vue";
</script>

<template>
  <header>
    <Navbar></Navbar>
  </header>
</template>

<style scoped lang="scss">
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-width: var(--min-page-width);
  z-index: 9999;
}
</style>
