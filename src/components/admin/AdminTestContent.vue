<script setup lang="ts">
import { useAdminAuth } from "@/utils/admin-auth-provider";
import { onMounted, ref } from "vue";
import SimpleButton from "@/components/common/SimpleButton.vue";
import PageContent from "@/components/common/PageContent.vue";

const { callAdminApi, logout } = useAdminAuth();

const testSecret = ref<string | null>(null);

async function handleLogout() {
  await logout();
}

async function handleMounted() {
  const response = await callAdminApi("/api/admin/testSecret", {});
  if (response.ok) {
    const data = await response.json();
    testSecret.value = data.secret;
  }
}

onMounted(() => {
  handleMounted();
});
</script>

<template>
  <PageContent title="Admin Page" title-margin="1rem">
    <p>
      Now that you're authenticated, I can tell you a secret! Here it is: "{{
        testSecret
      }}".
    </p>
    <SimpleButton
      :content="{ text: 'Logout' }"
      theme="filled"
      layout="traditional-wide"
      class="logout-button"
      @click="handleLogout"
    ></SimpleButton>
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

// TODO: Add your code here.
.logout-button {
  margin-top: 1rem;
  align-self: flex-start;
}
</style>
