import { z } from "zod";
import { Role } from "../admin/session";

/** Supplies a schema and serializer for the API's input parameters. */
export function params<Schema extends z.ZodTypeAny>(
  schema: Schema,
  serializer: (input: z.infer<Schema>) => z.input<Schema>,
) {
  return {
    paramsSchema: schema,
    paramsSerializer: serializer,
  };
}

/** Supplies a schema and serializer for the API's result response. */
export function result<Schema extends z.ZodTypeAny>(
  schema: Schema,
  serializer: (input: z.infer<Schema>) => z.input<Schema>,
) {
  return {
    resultSchema: schema,
    resultSerializer: serializer,
  };
}

export type ApiDefinition<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
> = {
  /**
   * The API endpoint, e.g. "departures" for "example.com/api/departures" or
   * "disruptions/rejected" for "example.com/api/disruptions/rejected".
   */
  endpoint: string;
  /**
   * The admin role the user needs to have, e.g. ["superadmin"]. Use an empty
   * array if no authentication is needed to call this API.
   */
  requiredRoles: Role[];
  /**
   * True if the config hash should be sent along with the request, and the
   * updated config sent back if the server has a newer version.
   */
  checkConfigHash: boolean;

  /** The schema of the API's input parameters. */
  paramsSchema: ParamsSchema;
  /** A function that can serialize the API's input parameters to JSON. */
  paramsSerializer: (input: z.infer<ParamsSchema>) => z.input<ParamsSchema>;

  /** The schema of the API's result response. */
  resultSchema: ResultSchema;
  /** A function that can serialize the API's result response to JSON. */
  resultSerializer: (input: z.infer<ResultSchema>) => z.input<ResultSchema>;
};

/**
 * Builds an {@link ApiDefinition} (allowing the params and result schemas to be
 * provided inline).
 */
export function api(def: ApiDefinition<any, any>) {
  return def;
}
