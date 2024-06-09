import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { TimestampedData, requirePositiveInteger } from "./utils";

export class CachedResult<T> {
  private _data: TimestampedData<T> | null;

  private readonly _cacheForSeconds: number;
  private readonly _allowExpiredCacheFallbackForSeconds: number;
  private readonly _getCurrentTime: () => QUtcDateTime;

  constructor(
    private readonly _fetch: () => Promise<T>,
    {
      getCurrentTime,
      cacheDurationSeconds,
      allowExpiredCacheFallbackForSeconds = 0,
    }: {
      getCurrentTime: () => QUtcDateTime;
      cacheDurationSeconds: number;
      allowExpiredCacheFallbackForSeconds?: number;
    },
  ) {
    this._data = null;

    requirePositiveInteger(cacheDurationSeconds, "cacheDurationSeconds");
    requirePositiveInteger(
      allowExpiredCacheFallbackForSeconds,
      "allowExpiredCacheFallbackForSeconds",
    );
    this._cacheForSeconds = cacheDurationSeconds;
    this._allowExpiredCacheFallbackForSeconds =
      allowExpiredCacheFallbackForSeconds;

    this._getCurrentTime = getCurrentTime;
  }

  async get(): Promise<TimestampedData<T>> {
    if (this._data !== null) {
      const cacheExpiry = this._data.timestamp.add({
        s: this._cacheForSeconds,
      });
      if (this._getCurrentTime().isBefore(cacheExpiry)) {
        return this._data;
      }
    }

    try {
      return this.fetch();
    } catch (error) {
      if (this._data !== null) {
        const fallbackExpiry = this._data.timestamp.add({
          s: this._allowExpiredCacheFallbackForSeconds,
        });
        if (this._getCurrentTime().isBefore(fallbackExpiry)) {
          return this._data;
        }
      }
      throw error;
    }
  }

  async fetch(): Promise<TimestampedData<T>> {
    const value = await this._fetch();
    const timestamp = this._getCurrentTime();
    this._data = { value, timestamp };
    return this._data;
  }
}
