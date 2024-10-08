import { EnvironmentVariables } from "../ctx/environment-variables";
import { ServerParams } from "../ctx/trainquery";
import { BadApiCallError } from "../param-utils";
import {
  Session,
  Role,
  applyRoleInheritance,
} from "../../shared/admin/session";
import { nowUTC } from "../../shared/qtime/luxon-conversions";

/** Disregard admin tokens that were created over 2 weeks ago. */
const tokenLifespanDays = 14;

/** Run a job to cleanup expired tokens every 60 minutes. */
const cleanupIntervalMillis = 60 * 60 * 1000;

interface AdminAuthDB {
  fetchAdminAuthSession(token: string): Promise<Session | null>;
  writeAdminAuthSession(session: Session): Promise<void>;
  deleteAdminAuthSession(token: string): Promise<void>;
  cleanupExpiredAdminAuthSessions(): Promise<void>;
}

export class LocalAdminAuthDB implements AdminAuthDB {
  private _sessions: Session[] = [];

  async fetchAdminAuthSession(token: string): Promise<Session | null> {
    return this._sessions.find((s) => s.token === token) ?? null;
  }
  async writeAdminAuthSession(session: Session): Promise<void> {
    this._sessions.push(session);
  }
  async deleteAdminAuthSession(token: string): Promise<void> {
    this._sessions = this._sessions.filter((s) => s.token !== token);
  }
  async cleanupExpiredAdminAuthSessions(): Promise<void> {
    const now = nowUTC();
    this._sessions = this._sessions.filter((s) => now.isBefore(s.expiry));
  }
}

export class AdminAuth {
  constructor(private readonly _db: AdminAuthDB) {}

  async init() {
    this._db.cleanupExpiredAdminAuthSessions();

    setInterval(() => {
      this._db.cleanupExpiredAdminAuthSessions();
    }, cleanupIntervalMillis);
  }

  async login(username: string, password: string): Promise<Session | null> {
    const superadmin = EnvironmentVariables.get().superadmin;

    // If there's no superadmin, then the admin dashboard is disabled
    // completely. How can we create other admin users without the superadmin?
    if (superadmin == null) {
      return null;
    }

    if (username === superadmin.username && password === superadmin.password) {
      return await this._createSession(username, ["superadmin"]);
    }

    // TODO: Check database for users other than the singular superadmin.

    return null;
  }

  async logout(token: string) {
    await this._db.deleteAdminAuthSession(token);
  }

  async getSession(token: string): Promise<Session | null> {
    const session = await this._db.fetchAdminAuthSession(token);
    if (session == null) {
      return null;
    }

    if (nowUTC().isAfter(session.expiry)) {
      await this._db.deleteAdminAuthSession(token);
      return null;
    }

    return session;
  }

  async legacyThrowUnlessAuthenticated(
    params: ServerParams,
    role: Role,
  ): Promise<Session> {
    const token = params.header.adminToken;
    if (token == null) {
      throw new BadApiCallError("No admin token provided.", 401);
    }

    const session = await this.getSession(token);
    if (session == null) {
      throw new BadApiCallError("Admin token invalid/expired.", 401);
    }

    const allRoles = applyRoleInheritance(session.roles);
    if (!allRoles.includes(role)) {
      throw new BadApiCallError("Access denied - Inadequate permissions.", 403);
    }

    return session;
  }

  async throwUnlessAuthenticated(
    token: string | null,
    role: Role,
  ): Promise<Session> {
    if (token == null) {
      throw new BadApiCallError("No admin token provided.", 401);
    }

    const session = await this.getSession(token);
    if (session == null) {
      throw new BadApiCallError("Admin token invalid/expired.", 401);
    }

    const allRoles = applyRoleInheritance(session.roles);
    if (!allRoles.includes(role)) {
      throw new BadApiCallError("Access denied - Inadequate permissions.", 403);
    }

    return session;
  }

  private async _createSession(
    username: string,
    roles: Role[],
  ): Promise<Session> {
    const session = new Session(
      username,
      roles,
      generateRandomToken(),
      nowUTC().add({ d: tokenLifespanDays }),
    );
    await this._db.writeAdminAuthSession(session);
    return session;
  }
}

function generateRandomToken(): string {
  return crypto
    .getRandomValues(new Uint8Array(32))
    .reduce((str, x) => str + x.toString(16).padStart(2, "0"), "");
}
