<script setup lang="ts">
import NotFoundLayout from "@/components/NotFoundLayout.vue";
import { generatePageHeadNotFound } from "@/utils/head";
import { useHead } from "@vueuse/head";
useHead(generatePageHeadNotFound("Page not found"));
</script>

<template>
  <NotFoundLayout
    title="Page not found"
    message="This page doesn't exist, at least not anymore!"
  ></NotFoundLayout>
</template>
