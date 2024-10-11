import { EnvironmentVariables } from "../ctx/environment-variables";

export abstract class ExternalDataRequest {
  abstract call(): Promise<Response>;
}

export class SimpleExternalDataRequest extends ExternalDataRequest {
  constructor(readonly url: string) {
    super();
  }

  call(): Promise<Response> {
    return fetch(this.url);
  }
}

export class RelayExternalDataRequest extends ExternalDataRequest {
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

export class GtfsRealtimeMelbourneExternalDataRequest extends ExternalDataRequest {
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
