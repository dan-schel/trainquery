import { z } from "zod";
import { QUtcDateTime } from "../qtime/qdatetime";

/** All roles with the authentication/permissions system. */
export const Roles = ["any", "superadmin"] as const;
/** A role in the authentication/permissions system, e.g. "superadmin". */
export type Role = (typeof Roles)[number];
/** Matches a value in {@link Roles}. */
export const RoleJson = z.enum(Roles);

export function applyRoleInheritance(roles: Role[]): Role[] {
  if (roles.length === 0) {
    throw new Error("User has no roles.");
  }

  const result = new Set(roles);
  result.add("any");
  return Array.from(result);
}

export class Session {
  constructor(
    readonly username: string,
    readonly roles: Role[],
    readonly token: string,
    readonly begun: QUtcDateTime,
  ) {}

  static readonly json = z
    .object({
      username: z.string(),
      roles: RoleJson.array(),
      token: z.string(),
      begun: QUtcDateTime.json,
    })
    .transform((x) => new Session(x.username, x.roles, x.token, x.begun));

  toJSON(): z.input<typeof Session.json> {
    return {
      username: this.username,
      roles: this.roles,
      token: this.token,
      begun: this.begun.toJSON(),
    };
  }
}
