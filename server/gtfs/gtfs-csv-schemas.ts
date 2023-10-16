import { z } from "zod";
import { parseIntNull } from "@schel-d/js-utils";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { QDate } from "../../shared/qtime/qdate";

const IntStringJson = z.string().transform((x, ctx) => {
  const result = parseIntNull(x);
  if (result == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not an integer.",
    });
    return z.NEVER;
  }
  return result;
});

const BooleanStringJson = z.string().transform((x, ctx) => {
  if (x == "1") {
    return true;
  }
  if (x == "0") {
    return true;
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Not a '0' or a '1'.",
  });
  return z.NEVER;
});

export const tripsSchema = z.object({
  // "1-Ech-mjp-10"
  // route_id: z.string(),

  // "T2_1"
  service_id: z.string(),

  // "1.T2.1-Ech-mjp-10.1.H"
  trip_id: z.string(),

  // "1-Ech-mjp-10.1.H"
  // shape_id: z.string(),

  // "Melbourne"
  // trip_headsign: z.string(),

  // "0"
  // direction_id: IntStringJson,
});

export const stopTimesSchema = z.object({
  // "1.T0.1-Ech-mjp-3.1.H"
  trip_id: z.string(),

  // "22:37:00"
  // arrival_time: QTimetableTime.json.refine((x) => x.isValid().valid),

  // "22:37:00"
  departure_time: QTimetableTime.json.refine((x) => x.isValid().valid),

  // "47642"
  stop_id: IntStringJson,

  // "1"
  stop_sequence: IntStringJson,

  // ""
  // stop_headsign: z.string(),

  // "0"
  // pickup_type: z.enum(["0", "1", "2", "3"]).transform(
  //   (x) =>
  //     ({
  //       "0": "yes" as const,
  //       "1": "no" as const,
  //       "2": "on-request" as const,
  //       "3": "on-request" as const,
  //     }[x])
  // ),

  // "0"
  // drop_off_type: z.enum(["0", "1", "2", "3"]).transform(
  //   (x) =>
  //     ({
  //       "0": "yes" as const,
  //       "1": "no" as const,
  //       "2": "on-request" as const,
  //       "3": "on-request" as const,
  //     }[x])
  // ),

  // "0.00"
  // shape_dist_traveled: z.string(),
});

export const calendarSchema = z.object({
  // "T0+WD77_1"
  service_id: z.string(),

  // "1"
  monday: BooleanStringJson,

  // "1"
  tuesday: BooleanStringJson,

  // "1"
  wednesday: BooleanStringJson,

  // "0"
  thursday: BooleanStringJson,

  // "0"
  friday: BooleanStringJson,

  // "0"
  saturday: BooleanStringJson,

  // "0"
  sunday: BooleanStringJson,

  // "20231023"
  start_date: QDate.json.refine((x) => x.isValid().valid),

  // "20231026"
  end_date: QDate.json.refine((x) => x.isValid().valid),
});

export const calendarDatesSchema = z.object({
  // "T0+WD6F"
  service_id: z.string(),

  // "20231107"
  date: QDate.json.refine((x) => x.isValid().valid),

  // "2"
  exception_type: z.enum(["1", "2"]).transform(
    (x) =>
    ({
      "1": "added" as const,
      "2": "removed" as const,
    }[x])
  ),
});
