import type { Stop } from "shared/system/stop";
import { getConfig } from "./get-config";
import { getStopPageRoute, requireStop } from "shared/system/config-utils";

// Don't show stops further than 50km away.
export const maxDistance = 50000;

export type NearbyStopData = {
  stop: Stop;
  latitude: number;
  longitude: number;
  distance: number;
  url: string;
};

export function getNearbyStops(
  latitude: number,
  longitude: number,
): NearbyStopData[] {
  const locations = getConfig().shared.locations.locations;
  const stopsWithLocations = Array.from(locations.entries())
    .map(([id, location]) => ({
      id,
      location,
      dist: measure(latitude, longitude, location.latitude, location.longitude),
    }))
    .sort((a, b) => a.dist - b.dist)
    .filter((x) => x.dist < maxDistance);

  const topThree = stopsWithLocations.slice(0, 3);

  return topThree.map(({ id, location, dist }) => ({
    stop: requireStop(getConfig(), id),
    latitude: location.latitude,
    longitude: location.longitude,
    distance: dist,
    url: getStopPageRoute(getConfig(), id, null, null),
  }));
}

export function formatDistance(distance: number) {
  const nearestTenMeters = Math.round(distance / 10) * 10;

  if (nearestTenMeters < 10) {
    return "<10m";
  } else if (nearestTenMeters < 1000) {
    return `~${nearestTenMeters.toFixed()}m`;
  } else if (nearestTenMeters < 20000) {
    return `~${(nearestTenMeters / 1000).toFixed(1)}km`;
  } else {
    return `~${(nearestTenMeters / 1000).toFixed(0)}km`;
  }
}

/**
 * Haversine formula - Thanks to StackOverflow:
 * https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
 */
function measure(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusOfEarthMeters = 6378137;
  const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusOfEarthMeters * c;
}
