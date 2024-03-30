<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminStatus from "@/components/admin/status/AdminStatus.vue";

useHead(
  generatePageHead({
    title: "Status",
    allowIndexing: false,
    canonicalUrl: "/admin/status",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminStatus></AdminStatus>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
