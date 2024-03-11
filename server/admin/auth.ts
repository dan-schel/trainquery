import { EnvironmentVariables } from "../ctx/environment-variables";
import { ServerParams } from "../ctx/trainquery";
import { BadApiCallError } from "../param-utils";

export type Role = "superadmin" | "any";

export type Session = {
  username: string;
  roles: Role[];
  token: string;
};

export class AdminAuth {
  private _sessions: Session[] = [];

  login(username: string, password: string): Session | null {
    const superadmin = EnvironmentVariables.get().superadmin;

    // If there's no superadmin, then the admin dashboard is disabled
    // completely. How can we create other admin users without the superadmin?
    if (superadmin == null) {
      return null;
    }

    if (username === superadmin.username && password === superadmin.password) {
      return this._createSession(username, ["superadmin"]);
    }

    // TODO: Check database for users other than the singular superadmin.

    return null;
  }

  logout(token: string) {
    const session = this.getSession(token);
    if (session == null) {
      return;
    }
    this._sessions = this._sessions.filter(
      (s) => s.username !== session.username,
    );
  }

  getSession(token: string): Session | null {
    return this._sessions.find((s) => s.token === token) ?? null;
  }

  throwUnlessAuthenticated(params: ServerParams, role: Role): Session {
    const token = params.header.adminToken;
    if (token == null) {
      throw new BadApiCallError("No admin token provided.", 401);
    }

    const session = this.getSession(token);
    if (
      session == null ||
      !this._inheritedRoles(session.roles).includes(role)
    ) {
      throw new BadApiCallError("Invalid admin token.", 403);
    }

    return session;
  }

  private _inheritedRoles(roles: Role[]): Role[] {
    const result = [...roles];
    if (result.length > 1) {
      result.push("any");
    }
    return result;
  }

  private _createSession(username: string, roles: Role[]): Session {
    const session = {
      username,
      roles: roles,
      token: generateRandomToken(),
    };

    this._sessions = this._sessions.filter((s) => s.username !== username);
    this._sessions.push(session);
    return session;
  }
}

function generateRandomToken(): string {
  return crypto
    .getRandomValues(new Uint8Array(32))
    .reduce((str, x) => str + x.toString(16).padStart(2, "0"), "");
}
