<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminTestContent from "@/components/admin/AdminTestContent.vue";

useHead(
  generatePageHead({
    title: "Admin dashboard",
    allowIndexing: false,
    canonicalUrl: "/admin",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminTestContent></AdminTestContent>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
