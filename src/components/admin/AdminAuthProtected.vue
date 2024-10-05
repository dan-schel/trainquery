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
import { type ApiDefinition } from "shared/api/api-definition";
import { callApi } from "@/utils/call-api";
import type { FetchResult } from "@/utils/call-api-fetcher";
import { loginApi } from "shared/api/admin/login-api";
import { logoutApi } from "shared/api/admin/logout-api";

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

async function callAdminApi<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  params: P,
  { resilient = true }: { resilient?: boolean } = {},
): Promise<FetchResult<R>> {
  if (session.value == null) {
    throw new Error(
      "Unauthenticated - do not call callAdminApi() outside of an admin-protected route!",
    );
  }

  const response = await callApi(api, params, {
    resilient,
    authSession: session.value,
  });

  if (response.type === "error") {
    if (response.httpCode === 401) {
      console.warn("Admin token invalid or expired. You have been logged out.");
      setSession(null, true);
    }
  }

  return response;
}

async function login(username: string, password: string) {
  if (username.length < 1 || password.length < 1) {
    throw new Error("Username and password required.");
  }

  const response = await callApi(loginApi, { username, password });

  if (response.type === "success") {
    const session = response.data;
    if (session == null) {
      throw new Error("Incorrect username or password.");
    }
    setSession(session, true);
    return session;
  } else if (response.type === "error") {
    if (response.httpCode === 429) {
      throw new Error("Too many login attempts. Please try again later.");
    }
    throw new Error("Something went wrong during login.");
  } else {
    throw new Error("Something went wrong during login.");
  }
}

async function logout() {
  await callAdminApi(logoutApi, null);
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
