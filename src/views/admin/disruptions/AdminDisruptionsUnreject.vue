<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDisruptionsUnreject from "@/components/admin/disruptions/unreject/AdminDisruptionsUnreject.vue";

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
    <AdminDisruptionsUnreject></AdminDisruptionsUnreject>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
