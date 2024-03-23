import { Session } from "shared/admin/session";
import { ref, type InjectionKey, inject, type Ref } from "vue";

const lsKey = "trainquery-admin-auth";

export const adminAuthInjectionKey = Symbol() as InjectionKey<{
  session: Ref<Session | null>;
  requireSession: () => Session;
  login: (username: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  callAdminApi: (
    apiPath: string,
    params: Record<string, string>,
  ) => Promise<Response>;
}>;

export function useAdminAuth() {
  return inject(adminAuthInjectionKey, {
    session: ref(null),
    requireSession: () => {
      throw new Error("Admin auth not injected correctly.");
    },
    login: () => {
      throw new Error("Admin auth not injected correctly.");
    },
    logout: () => {
      throw new Error("Admin auth not injected correctly.");
    },
    callAdminApi: () => {
      throw new Error("Admin auth not injected correctly.");
    },
  });
}

export function readAdminAuth(): Session | null {
  const existing = localStorage.getItem(lsKey);
  if (existing == null) {
    return null;
  }

  try {
    return Session.json.parse(JSON.parse(existing));
  } catch {
    console.warn("Failed to parse admin auth, will require reauthentication.");
    return null;
  }
}

export function writeAdminAuth(newAdminAuth: Session | null) {
  if (newAdminAuth == null) {
    localStorage.removeItem(lsKey);
  } else {
    localStorage.setItem(lsKey, JSON.stringify(newAdminAuth.toJSON()));
  }
}
