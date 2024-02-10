# TrainQuery

An unofficial guide to help you navigate Melbourne's train network, built on Vue.js, Express, and MongoDB. You can search for any suburban or regional train station to view upcoming departures, and adjust the departure time or filter to further refine the results.

✅ Live at [trainquery.com](https://trainquery.com)!

## Getting started

1.  Clone the repo with submodules. Either run `git clone --recursive https://github.com/dan-schel/trainquery.git`, or run `git submodule update --init --recursive` after cloning the repository.
2.  Run `npm i` to install dependencies.
3.  Create a `.env` file, as described below:

    ```dotenv
    # All values provided below are examples. Customize the values for your needs.

    # The canonical URL.
    URL = "https://trainquery.com"

    # The URL of the transit network configuration data.
    CONFIG = "https://static.trainquery.com/data.yml"

    # The port to run the server on (optional).
    PORT = 3000

    # The path of the transit network configuration data for offline mode
    # (optional - see "Developing without internet" below).
    CONFIG_OFFLINE = "offline/config.zip"

    # If persisting data to a MongoDB database, the domain, username, and password
    # to use to connect to the database (optional).
    MONGO_DOMAIN = "db.trainquery.com"
    MONGO_USERNAME = "..."
    MONGO_PASSWORD = "..."

    # If connecting to the PTV API, the credentials provided by PTV, used to query
    # the API (optional).
    PTV_DEV_ID = "..."
    PTV_DEV_KEY = "..."

    # If using "melbourne" style authentication for a GTFS-R API, the
    # authentication key (optional).
    GTFS_REALTIME_KEY = "..."
    ```

4.  Run `npm run dev` (or `npm run build` and `npm run start`)!

## Developing without internet

1.  Download a local copy of the static data zip file you wish to use.
2.  Set the `CONFIG_OFFLINE` environment variable to point to it, e.g. `CONFIG_OFFLINE = offline/config.zip`.
3.  Run `npm run dev -- offline` or `npm run build && npm run start -- offline`.

The `offline` directory is included in the `.gitignore` file for this purpose.

## Developing using local config

If you want to use the offline config as explained above, but still enable online features like the use of GTFS feeds or the PTV API, use `npm run dev -- offline-data` or `npm run build && npm run start -- offline-data`.

## Checking for static data errors

Run `npm run tqlint -- [data source]`, where `[data source]` is one of:

- Literally "`online`" to use the value of the `CONFIG` environment variable.
- Literally "`offline`" to use the value of the `CONFIG_OFFLINE` environment variable.
- A path to a local zip archive, e.g. `./offline/config.zip`
- The URL for an online zip archive, e.g. `"https://static.trainquery.com/data/2023-08-14.zip"`
- The URL of the manifest file, e.g. `"https://static.trainquery.com/data.yml"`
