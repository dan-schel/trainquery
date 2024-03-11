<script setup lang="ts">
import Wordmark from "@/components/Wordmark.vue";
import SimpleButton from "../common/SimpleButton.vue";
import { computed, ref } from "vue";
import { Session } from "shared/admin/session";
import { z } from "zod";

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const buttonDisabled = computed(
  () => loading.value || username.value.length < 1 || password.value.length < 1,
);

const emit = defineEmits<{
  (e: "logged-in", session: Session): void;
}>();

async function handleFormSubmit(e: Event) {
  e.preventDefault();

  if (username.value.length < 1 || password.value.length < 1) {
    error.value = "Username and password required.";
    return;
  }

  loading.value = true;
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  });
  loading.value = false;
  password.value = "";

  if (response.status === 429) {
    error.value = "Too many login attempts. Please try again later.";
    return;
  }

  if (!response.ok) {
    error.value = "Something went wrong during login.";
    return;
  }

  const json = await response.json();
  const schema = z.object({
    session: Session.json.nullable(),
  });
  const { session } = schema.parse(json);

  if (session == null) {
    error.value = "Incorrect username or password.";
    return;
  }

  error.value = null;
  emit("logged-in", session);
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
