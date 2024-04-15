import { Disruption } from "./disruption";
import { RawHandledDisruption } from "./raw-handled-disruption";

export abstract class ProcessedDisruption<
  Type extends string = string,
> extends Disruption<Type> {
  abstract getSources(): RawHandledDisruption[];
}
