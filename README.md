# TrainQuery

A rewrite of [TrainQuery](https://github.com/schel-d/melbpt) using a monolithic architecture and Vue.js.

## Developing without internet

1. Download a local copy of the static data zip file you wish to use.
2. Set the `CONFIG_OFFLINE` environment variable to point to it, e.g. `CONFIG_OFFLINE = offline/config.zip`.
3. Run `npm run dev -- offline` or `npm run build && npm run start -- offline`.

The offline folder is "gitignored" for this purpose.

## Checking for static data errors

Run `npm run tqlint -- [data source]`, where `[data source]` is one of:

- Literally "`online`" to use the value of the `CONFIG` environment variable.
- Literally "`offline`" to use the value of the `CONFIG_OFFLINE` environment variable.
- A path to a local zip archive, e.g. `./offline/config.zip`
- The URL for an online zip archive, e.g. `"https://static.trainquery.com/data/2023-08-14.zip"`
- The URL of the manifest file, e.g. `"https://static.trainquery.com/data.yml"`
