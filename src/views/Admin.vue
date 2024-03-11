<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";
import { generatePageHead } from "@/utils/head";
import { useHead } from "@vueuse/head";
import AdminLogin from "@/components/admin/AdminLogin.vue";
import type { Session } from "shared/admin/session";

function handleLoggedIn(session: Session) {
  console.log(session);
}

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
    <AdminLogin @logged-in="handleLoggedIn" />
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
