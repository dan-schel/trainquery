import { CompletePattern } from "../../../../shared/system/service/complete-pattern";
import {
  Service,
  StoppingPatternType,
} from "../../../../shared/system/service/service";
import { SkippedStop } from "../../../../shared/system/service/skipped-stop";
import { KnownPlatforms } from "../../../subsystem/ptv-platforms/platforms-external-data";
import { PtvPlatformsSubsystem } from "../../../subsystem/ptv-platforms/ptv-platforms";
import { ServiceTransform } from "../transform";

export class PtvPlatformsServiceTransform<
  T extends StoppingPatternType,
> extends ServiceTransform<T> {
  constructor(private readonly subsystem: PtvPlatformsSubsystem) {
    super();
  }

  transform(service: Service<T>): Service<T> {
    const knownPlatforms = this.subsystem.getKnownPlatforms();

    // This ignores the continuation on purpose. We assume the continuation has
    // already passed through the full fetch pipeline before it was attached to
    // the service.
    return service.with({
      pattern: this._transformPattern(service.pattern, knownPlatforms),
    });
  }

  private _transformPattern<Pattern extends StoppingPatternType>(
    pattern: Pattern,
    knownPlatforms: KnownPlatforms,
  ): Pattern {
    if (pattern instanceof CompletePattern) {
      return this._transformCompletePattern(pattern, knownPlatforms) as Pattern;
    }

    return pattern;
  }

  private _transformCompletePattern(
    pattern: CompletePattern,
    knownPlatforms: KnownPlatforms,
  ): CompletePattern {
    return pattern.with({
      stops: pattern.stops.map((s) => {
        if (s instanceof SkippedStop) {
          return s;
        }

        const relevant = knownPlatforms.get(s.stop);
        if (relevant == null) {
          return s;
        }

        const match = relevant.find(
          (x) =>
            x.scheduledDepartureTime.equals(s.scheduledTime) &&
            x.terminus === pattern.terminus.stop,
        );

        if (match == null) {
          return s;
        }

        return s.with({
          platform: {
            id: match.platform,
            confidence: "high",
          },
        });
      }),
    });
  }
}
