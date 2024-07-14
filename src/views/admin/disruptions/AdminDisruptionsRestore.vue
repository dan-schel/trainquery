<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDisruptionsRestore from "@/components/admin/disruptions/restore/AdminDisruptionsRestore.vue";

useHead(
  generatePageHead({
    title: "Rejected disruption",
    allowIndexing: false,
    canonicalUrl: "/admin/disruptions",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminDisruptionsRestore></AdminDisruptionsRestore>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
