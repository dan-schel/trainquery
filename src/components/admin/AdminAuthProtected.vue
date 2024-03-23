<script setup lang="ts">
import AdminLogin from "./AdminLogin.vue";
import PageContent from "@/components/common/PageContent.vue";
import {
  adminAuthInjectionKey,
  readAdminAuth,
  writeAdminAuth,
} from "@/utils/admin-auth-provider";
import { Session } from "shared/admin/session";
import { onMounted, provide, ref } from "vue";
import { z } from "zod";

const session = ref<Session | null>(null);
const mounted = ref(false);

function setSession(newSession: Session | null, write: boolean) {
  session.value = newSession;
  if (write) {
    writeAdminAuth(newSession);
  }
}

function requireSession() {
  if (session.value == null) {
    throw new Error(
      "Unauthenticated - do not call requireSession() outside of an admin-protected route!",
    );
  }
  return session.value;
}

async function callAdminApi(
  apiPath: string,
  params: Record<string, string>,
): Promise<Response> {
  if (session.value == null) {
    throw new Error(
      "Unauthenticated - do not call callAdminApi() outside of an admin-protected route!",
    );
  }

  const url = new URL(apiPath, window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const response = await fetch(url.href, {
    headers: {
      "admin-token": session.value.token,
    },
  });

  // Occurs if the admin token is invalid or expired. Does NOT occur if the user
  // has the wrong role/inadequate permissions.
  if (response.status === 401) {
    console.warn("Admin token invalid or expired. You have been logged out.");
    setSession(null, true);
  }

  return response;
}

async function login(username: string, password: string) {
  if (username.length < 1 || password.length < 1) {
    throw new Error("Username and password required.");
  }

  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (response.status === 429) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  if (!response.ok) {
    throw new Error("Something went wrong during login.");
  }

  const json = await response.json();
  const schema = z.object({
    session: Session.json.nullable(),
  });
  const { session } = schema.parse(json);

  if (session == null) {
    throw new Error("Incorrect username or password.");
  }

  setSession(session, true);
  return session;
}

async function logout() {
  await callAdminApi("/api/admin/logout", {});
  setSession(null, true);
}

provide(adminAuthInjectionKey, {
  session: session,
  requireSession,
  login,
  logout,
  callAdminApi,
});

onMounted(() => {
  setSession(readAdminAuth(), false);
  mounted.value = true;
});
</script>

<template>
  <slot v-bind="$attrs" v-if="session != null && mounted"></slot>
  <PageContent :title="null" v-bind="$attrs" v-else-if="mounted">
    <AdminLogin />
  </PageContent>
</template>

<style scoped lang="scss">
@use "@/assets/css-template/import" as template;

// TODO: Add your code here.
</style>
