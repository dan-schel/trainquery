<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminGtfs from "@/components/admin/gtfs/AdminGtfs.vue";

useHead(
  generatePageHead({
    title: "GTFS Parsing",
    allowIndexing: false,
    canonicalUrl: "/admin/gtfs",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminGtfs></AdminGtfs>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
