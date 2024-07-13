<script setup lang="ts">
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminAuthProtected from "@/components/admin/AdminAuthProtected.vue";
import AdminDisruptionsProcess from "@/components/admin/disruptions/AdminDisruptionsProcess.vue";

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
    <AdminDisruptionsProcess></AdminDisruptionsProcess>
  </AdminAuthProtected>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
