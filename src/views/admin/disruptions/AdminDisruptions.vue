<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDisruptions from "@/components/admin/disruptions/AdminDisruptions.vue";

useHead(
  generatePageHead({
    title: "Disruptions",
    allowIndexing: false,
    canonicalUrl: "/admin/disruptions",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminDisruptions></AdminDisruptions>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
