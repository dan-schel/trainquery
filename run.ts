import app from "./index";

// TODO: Need to create a script to download a repo e.g.
// "github.com/dan-schel/trainquery-melbourne" for development purposes. That
// said, since env vars are not committed to the repo, those would still need to
// be provided manually.

app({
  url: "",
  port: "",
  relayKey: "",
  mongoDatabaseUrl: "",
  superadminUsername: "",
  superadminPassword: "",
  config: "",
  ptvDevId: "",
  ptvDevKey: "",
  gtfsRealtimeKey: "",
});
