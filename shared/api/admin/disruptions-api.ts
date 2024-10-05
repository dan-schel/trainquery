import { z } from "zod";
import { api } from "../api-definition";
import { ExternalDisruptionInInbox } from "../../disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../disruptions/external/rejected-external-disruption";
import { ExternalDisruptionIDJson } from "../../system/ids";
import { Disruption } from "../../disruptions/processed/disruption";
import { ExternalDisruption } from "../../disruptions/external/external-disruption";

export const disruptionInboxApi = api({
  endpoint: "admin/disruption/inbox",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.null(),
  resultSchema: z.object({
    inbox: ExternalDisruptionInInbox.json.array(),
    counts: z.object({
      inbox: z.number(),
      updated: z.number(),
    }),
  }),

  paramsSerializer: (_params) => null,
  resultSerializer: (result) => ({
    inbox: result.inbox.map((x) => x.toJSON()),
    counts: {
      inbox: result.counts.inbox,
      updated: result.counts.updated,
    },
  }),
});

export const disruptionRejectedApi = api({
  endpoint: "admin/disruption/rejected",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.null(),
  resultSchema: z.object({
    rejected: RejectedExternalDisruption.json.array(),
    counts: z.object({
      inbox: z.number(),
      updated: z.number(),
    }),
  }),

  paramsSerializer: (_params) => null,
  resultSerializer: (result) => ({
    rejected: result.rejected.map((x) => x.toJSON()),
    counts: {
      inbox: result.counts.inbox,
      updated: result.counts.updated,
    },
  }),
});

export const disruptionInboxSingleApi = api({
  endpoint: "admin/disruption/inbox/single",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.object({
    id: ExternalDisruptionIDJson,
  }),
  resultSchema: z.union([
    z.object({
      notFound: z.literal(true),
    }),
    z.object({
      inbox: ExternalDisruptionInInbox.json,
      provisional: Disruption.json.array(),
    }),
  ]),

  paramsSerializer: (params) => ({ id: params.id }),
  resultSerializer: (result) =>
    "notFound" in result
      ? { notFound: result.notFound }
      : {
          inbox: result.inbox.toJSON(),
          provisional: result.provisional.map((x) => x.toJSON()),
        },
});

export const disruptionRejectedSingleApi = api({
  endpoint: "admin/disruption/rejected/single",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.object({
    id: ExternalDisruptionIDJson,
  }),
  resultSchema: z.union([
    z.object({
      notFound: z.literal(true),
    }),
    z.object({
      rejected: RejectedExternalDisruption.json,
    }),
  ]),

  paramsSerializer: (params) => ({ id: params.id }),
  resultSerializer: (result) =>
    "notFound" in result
      ? { notFound: result.notFound }
      : { rejected: result.rejected.toJSON() },
});

export const disruptionInboxProcessApi = api({
  endpoint: "admin/disruption/inbox/process",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.object({
    reject: z.object({
      disruption: ExternalDisruption.json,
      resurfaceIfUpdated: z.boolean(),
    }),
  }),
  resultSchema: z.null(),

  paramsSerializer: (params) => ({
    reject: {
      disruption: params.reject.disruption.toJSON(),
      resurfaceIfUpdated: params.reject.resurfaceIfUpdated,
    },
  }),
  resultSerializer: (_result) => null,
});

export const disruptionRejectedRestoreApi = api({
  endpoint: "admin/disruption/rejected/restore",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.object({
    restore: ExternalDisruptionIDJson,
  }),
  resultSchema: z.null(),

  paramsSerializer: (params) => ({
    restore: params.restore,
  }),
  resultSerializer: (_result) => null,
});
