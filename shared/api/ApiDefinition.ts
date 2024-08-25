import { z } from "zod";
import { Role } from "../admin/session";

export const HttpMethods = ["get", "post", "put", "delete"] as const;
export type HttpMethod = (typeof HttpMethods)[number];
export const HttpMethodsJson = z.enum(HttpMethods);

export type HttpRequest<Method extends HttpMethod> = Method extends "get"
  ? HttpRequestWithoutBody
  : HttpRequestWithBody;
export type HttpRequestWithoutBody = {
  params: Record<string, string>;
  body: null;
};
export type HttpRequestWithBody = {
  params: Record<string, string>;
  body: object;
};

export type ApiDefinition<
  Arguments,
  Response,
  Method extends HttpMethod,
  Request extends HttpRequest<Method>,
> = {
  /** The API endpoint, e.g. "/api/departures". */
  endpoint: string;
  /** The HTTP method, e.g. "get" or "post". */
  httpMethod: Method;
  /**
   * The admin role the user needs to have, e.g. ["superadmin"]. Use an empty
   * array if no authentication is needed to call this API.
   */
  requiredRoles: Role[];
  /**
   * True if the network data hash should be sent along with the request, and
   * updated data sent back if the server has a newer version.
   */
  checkNetworkHash: boolean;
  /** The Zod schema to validate the arguments. */
  argumentsSchema: z.ZodType<Arguments>;
  /** The Zod schema to validate the response. */
  responseSchema: z.ZodType<Response>;
  /** The Zod schema to validate the HTTP request. */
  requestSchema: z.ZodType<Request>;
  /** Builds a HTTP request used to call the API from the arguments given. */
  buildRequest: (args: Arguments) => Request;
  /** Parses API arguments from an incoming HTTP request. */
  parseRequest: (request: Request) => Arguments;
};
