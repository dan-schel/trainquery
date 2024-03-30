<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminUsers from "@/components/admin/users/AdminUsers.vue";

useHead(
  generatePageHead({
    title: "Users",
    allowIndexing: false,
    canonicalUrl: "/admin/users",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminUsers></AdminUsers>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
