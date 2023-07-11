<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/header/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <Header></Header>
  <div class="page">
    <RouterView />
  </div>
  <Footer></Footer>
</template>

<style scoped lang="scss">
.page {
  flex-grow: 1;
  margin-top: 3rem;
}
</style>
