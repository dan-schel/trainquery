<script setup lang="ts">
import Wordmark from "@/components/Wordmark.vue";
import SimpleButton from "../common/SimpleButton.vue";
import { computed, ref } from "vue";
import { useAdminAuth } from "@/utils/admin-auth-provider";

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const buttonDisabled = computed(
  () => loading.value || username.value.length < 1 || password.value.length < 1,
);

const { login } = useAdminAuth();

async function handleFormSubmit(e: Event) {
  e.preventDefault();

  try {
    loading.value = true;
    await login(username.value, password.value);
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit="handleFormSubmit">
    <Wordmark class="logo"></Wordmark>
    <h1>Sign in to admin dashboard</h1>
    <p class="error" v-if="error != null">{{ error }}</p>
    <label>
      <p>Username</p>
      <input type="text" v-model="username" />
    </label>
    <label>
      <p>Password</p>
      <input type="password" v-model="password" />
    </label>
    <SimpleButton
      :content="{ text: loading ? 'Loading...' : 'Sign in' }"
      theme="filled"
      :submit="true"
      :disabled="buttonDisabled"
    ></SimpleButton>
    <p class="notice">Admin dashboard access is for site admins only.</p>
  </form>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

form {
  max-width: 30rem;
  gap: 2rem;
  flex-grow: 1;
  padding: 2rem 0;
}
.logo {
  font-size: 1.5em;
  text-align: center;
}
h1 {
  @include utils.h2;
}
.error {
  color: var(--color-error);
  font-weight: bold;
  margin-top: -1rem;
}
label p {
  margin-bottom: 0.5rem;
}
input {
  @include template.input-filled-neutral;
  height: 2rem;
  padding: 0rem 0.75rem;
}
.notice {
  font-size: 0.8rem;
  font-stretch: semi-condensed;
}
</style>
