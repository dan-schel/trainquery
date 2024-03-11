<script setup lang="ts">
import Wordmark from "@/components/Wordmark.vue";
import SimpleButton from "../common/SimpleButton.vue";
</script>

<template>
  <form>
    <div class="spacer"></div>
    <Wordmark class="logo"></Wordmark>
    <h1>Sign in to admin dashboard</h1>
    <label>
      <p>Username</p>
      <input type="text" />
    </label>
    <label>
      <p>Password</p>
      <input type="password" />
    </label>
    <SimpleButton :content="{ text: 'Sign in' }" theme="filled"></SimpleButton>
    <p class="notice">Designed for site admins only.</p>
    <div class="spacer"></div>
  </form>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;
@use "@/assets/utils" as utils;

form {
  max-width: 30rem;
  gap: 2rem;
  flex-grow: 1;
}
.spacer:first-child {
  flex-grow: 2;
}
.spacer:last-child {
  flex-grow: 3;
}
.logo {
  font-size: 1.5em;
  text-align: center;
}
h1 {
  @include utils.h2;
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
