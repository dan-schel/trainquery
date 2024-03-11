import { z } from "zod";

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
  ) {}

  static readonly json = z
    .object({
      username: z.string(),
      roles: RoleJson.array(),
      token: z.string(),
    })
    .transform((x) => new Session(x.username, x.roles, x.token));

  toJSON(): z.input<typeof Session.json> {
    return {
      username: this.username,
      roles: this.roles,
      token: this.token,
    };
  }
}
