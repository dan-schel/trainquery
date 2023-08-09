<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/header/Header.vue";
import Footer from "./components/Footer.vue";
import { useHead } from "@vueuse/head";
import { getConfig } from "./utils/cached-config";

useHead({
  titleTemplate: (title?: string) =>
    `${title ?? "Page"} | ${getConfig().frontend.appName}`,
  meta: [
    { name: "description", content: getConfig().frontend.metaDescription },
  ],
});
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
./utils/cached-config
