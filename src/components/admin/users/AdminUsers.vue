<script setup lang="ts">
import PageContent from "@/components/common/PageContent.vue";

// const { callAdminApi } = useAdminAuth();

// const testSecret = ref<string>("Loading...");

// async function handleMounted() {
//   const response = await callAdminApi("/api/admin/testSecret", {});
//   if (response.ok) {
//     const data = await response.json();
//     testSecret.value = data.secret;
//   }
// }

// onMounted(() => {
//   handleMounted();
// });
</script>

<template>
  <PageContent title="Users" title-margin="1rem">
    <p>User management features are not implemented yet!</p>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
</style>
