<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminLogin from "@/components/admin/AdminLogin.vue";

useHead(
  generatePageHead({
    title: "Admin dashboard",
    allowIndexing: false,
    canonicalUrl: "/admin",
  }),
);
</script>

<template>
  <PageContent :title="null">
    <AdminLogin />
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
