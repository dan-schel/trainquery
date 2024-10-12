import { z } from "zod";
import { EnvironmentVariables } from "../ctx/environment-variables";

export abstract class RequestBuilder {
  abstract call(): Promise<Response>;
}

export class SimpleRequestBuilder extends RequestBuilder {
  constructor(readonly url: string) {
    super();
  }

  call(): Promise<Response> {
    return fetch(this.url);
  }
}

export class RelayRequestBuilder extends RequestBuilder {
  private _relayKey: string;

  constructor(readonly url: string) {
    super();
    this._relayKey = EnvironmentVariables.get().requireRelayKey();
  }

  call(): Promise<Response> {
    return fetch(this.url, {
      headers: {
        "relay-key": this._relayKey,
      },
    });
  }
}

export class VicDataExchangeRequestBuilder extends RequestBuilder {
  private _apiKey: string;

  constructor(readonly url: string) {
    super();
    this._apiKey = EnvironmentVariables.get().requireGtfsRealtimeKey();
  }

  call(): Promise<Response> {
    return fetch(this.url, {
      headers: {
        "Ocp-Apim-Subscription-Key": this._apiKey,
      },
    });
  }
}

export const requestBuilderJson = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("simple"),
      url: z.string(),
    }),
    z.object({
      type: z.literal("relay"),
      url: z.string(),
    }),
    z.object({
      type: z.literal("vic-data-exchange"),
      url: z.string(),
    }),
  ])
  .transform((x) => {
    switch (x.type) {
      case "simple":
        return new SimpleRequestBuilder(x.url);
      case "relay":
        return new RelayRequestBuilder(x.url);
      case "vic-data-exchange":
        return new VicDataExchangeRequestBuilder(x.url);
      default:
        throw new Error("Unknown request builder type");
    }
  });
