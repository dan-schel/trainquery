import { z } from "zod";
import { type Role } from "../admin/session";

/** Supplies a schema and serializer for the API's input parameters. */
export function params<P, PS>(
  schema: z.ZodType<P, any, PS>,
  serializer: (input: P) => PS,
) {
  return {
    paramsSchema: schema,
    paramsSerializer: serializer,
  };
}

/** Supplies a schema and serializer for the API's result response. */
export function result<R, RS>(
  schema: z.ZodType<R, any, RS>,
  serializer: (input: R) => RS,
) {
  return {
    resultSchema: schema,
    resultSerializer: serializer,
  };
}

export type ApiDefinition<P, R, PS, RS> = {
  /**
   * The API endpoint, e.g. "departures" for "example.com/api/departures" or
   * "disruptions/rejected" for "example.com/api/disruptions/rejected".
   */
  endpoint: string;
  /**
   * The admin role the user needs to have, e.g. "superadmin", or null if no
   * authentication is needed to call this API.
   */
  requiredRole: Role | null;
  /**
   * True if the config hash should be sent along with the request, and the
   * updated config sent back if the server has a newer version.
   */
  checkConfigHash: boolean;

  /** The schema of the API's input parameters. */
  paramsSchema: z.ZodType<P, any, PS>;
  /** A function that can serialize the API's input parameters to JSON. */
  paramsSerializer: (input: P) => PS;

  /** The schema of the API's result response. */
  resultSchema: z.ZodType<R, any, RS>;
  /** A function that can serialize the API's result response to JSON. */
  resultSerializer: (input: R) => RS;
};

/**
 * Builds an {@link ApiDefinition} (allowing the params and result schemas to be
 * provided inline).
 */
export function api<P, R, PS, RS>(def: ApiDefinition<P, R, PS, RS>) {
  return def;
}
