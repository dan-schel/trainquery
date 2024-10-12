import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";

export abstract class PolledExternalData<T> {
  private value: { data: T; timestamp: QUtcDateTime } | null = null;

  constructor(protected readonly refreshMs: number) {}

  async init({ startPolling = true } = {}): Promise<void> {
    await this._fetch();
    if (startPolling) {
      this.startPolling();
    }
  }

  startPolling() {
    setInterval(async () => {
      try {
        await this._fetch();
      } catch (e) {
        this.onError(e);
      }
    }, this.refreshMs);
  }

  async _fetch() {
    this.value = {
      data: await this.fetch(),
      timestamp: nowUTC(),
    };
  }

  protected abstract fetch(): Promise<T>;

  protected abstract onError(e: unknown): void;

  get(): T {
    if (this.value === null) {
      throw new Error("Data unavailable - call init() first.");
    }
    return this.value.data;
  }
  getTimestamp(): QUtcDateTime {
    if (this.value === null) {
      throw new Error("Data unavailable - call init() first.");
    }
    return this.value.timestamp;
  }
}
