<script setup lang="ts">
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { useHead } from "@vueuse/head";
useHead({
  title: "Not found",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<template>
  <NotFoundLayout
    title="Page not found"
    message="This page doesn't exist, at least not anymore!"
  ></NotFoundLayout>
</template>
