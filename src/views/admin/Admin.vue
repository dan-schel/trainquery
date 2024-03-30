<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDashboard from "@/components/admin/AdminDashboard.vue";

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
    <AdminDashboard></AdminDashboard>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
