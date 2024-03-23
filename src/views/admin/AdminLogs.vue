<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminLogs from "@/components/admin/logs/AdminLogs.vue";

useHead(
  generatePageHead({
    title: "Logs",
    allowIndexing: false,
    canonicalUrl: "/admin/logs",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminLogs></AdminLogs>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
