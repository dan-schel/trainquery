<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDisruptionsRaw from "@/components/admin/disruptions/AdminDisruptionsRaw.vue";

useHead(
  generatePageHead({
    title: "Process disruptions",
    allowIndexing: false,
    canonicalUrl: "/admin/disruptions",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminDisruptionsRaw></AdminDisruptionsRaw>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
