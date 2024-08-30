import { Session } from "shared/admin/session";
import type { ApiDefinition } from "shared/api/api-definition";
import { nowUTC } from "shared/qtime/luxon-conversions";
import { ref, type InjectionKey, inject, type Ref } from "vue";
import type { FetchResult } from "./call-api-fetcher";

const lsKey = "trainquery-admin-auth";

export const adminAuthInjectionKey = Symbol() as InjectionKey<{
  session: Ref<Session | null>;
  requireSession: () => Session;
  login: (username: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  callAdminApiLegacy: (
    apiPath: string,
    params: Record<string, string>,
    usePost?: boolean,
  ) => Promise<Response>;
  callAdminApi: <P, R, PS, RS>(
    api: ApiDefinition<P, R, PS, RS>,
    params: P,
    options?: { resilient?: boolean },
  ) => Promise<FetchResult<R>>;
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
    callAdminApiLegacy: () => {
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
    const session = Session.json.parse(JSON.parse(existing));

    // We check here only because it's nicer to have the user logged out when
    // they first open the admin dashboard, rather than the first time they make
    // an actual API call (where the server, as the source of truth, will
    // actually tell us when to delete the token).
    if (nowUTC().isAfter(session.expiry)) {
      writeAdminAuth(null);
      return null;
    }

    return session;
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
