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

export class GtfsRealtimeMelbourneRequestBuilder extends RequestBuilder {
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
