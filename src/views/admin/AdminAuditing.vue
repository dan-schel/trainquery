<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminAuditing from "@/components/admin/auditing/AdminAuditing.vue";

useHead(
  generatePageHead({
    title: "Auditing",
    allowIndexing: false,
    canonicalUrl: "/admin/auditing",
  }),
);
</script>

<template>
  <AdminAuthProtected>
    <AdminAuditing></AdminAuditing>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
