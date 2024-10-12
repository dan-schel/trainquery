import { FullConfig } from "../config/computed-config";
import { DisruptionTransactions } from "../disruptions/disruptions-database";
import { EnvironmentOptions } from "./environment-options";
import { TrainQuery, Server } from "./trainquery";

export abstract class Logger {
  abstract init(ctx: TrainQuery): Promise<void>;

  abstract logInstanceStarting(instanceID: string): void;
  abstract logServerListening(server: Server): void;
  abstract logEnvOptions(envOptions: EnvironmentOptions): void;

  abstract logConfigRefresh(config: FullConfig, initial: boolean): void;
  abstract logConfigRefreshFailure(err: unknown): void;
  abstract logTimetableLoadFail(path: string): void;

  abstract logRecallingGtfs(): void;
  abstract logRecallingGtfsSuccess(): void;
  abstract logRecallingGtfsEmpty(): void;
  abstract logRecallingGtfsFailure(err: unknown): void;
  abstract logRefreshingGtfs(): void;
  abstract logRefreshingGtfsSuccess(): void;
  abstract logRefreshingGtfsFailure(err: unknown): void;
  abstract logPersistingGtfs(): void;
  abstract logPersistingGtfsSuccess(): void;
  abstract logPersistingGtfsFailure(err: unknown): void;
  abstract logRefreshingGtfsRealtime(subfeed: string | null): void;
  abstract logRefreshingGtfsRealtimeSuccess(subfeed: string | null): void;
  abstract logRefreshingGtfsRealtimeFailure(
    subfeed: string | null,
    err: unknown,
  ): void;

  abstract logFetchingDisruptions(source: string): void;
  abstract logFetchingDisruptionsSuccess(source: string, count: number): void;
  abstract logFetchingDisruptionsFailure(source: string, err: unknown): void;
  abstract logDisruptionProvidersNotReady(numUnavailable: number): void;
  abstract logDisruptionTransactions(
    transactions: DisruptionTransactions,
  ): void;

  abstract logFetchingPtvPlatformsFailure(err: unknown): void;
  abstract logUnknownPtvPlatform(stopName: string, ptvPlatformID: string): void;
}
