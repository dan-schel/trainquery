import { getConfig } from "@/utils/get-config";
import type { IconID } from "../icons/Icon.vue";
import {
  getLinePageRoute,
  getStopPageRoute,
  linesThatStopAt,
} from "shared/system/config-utils";
import type { Stop } from "shared/system/stop";
import { listifyAnd } from "@schel-d/js-utils";
import { formatMode } from "@/utils/format-mode";

/** An entry in a list of searchable pages. */
export type SearchOption = {
  title: string;
  subtitle: string | null;
  icon: IconID;
  url: string;
  tags: string[];
  data: unknown | null;
  boost: number;
};

/** Returns a search option for each stop. */
export function searchOptionsStops(): SearchOption[] {
  const options: SearchOption[] = [];

  options.push(
    ...getConfig().shared.stops.map((s) => {
      return {
        title: `${s.name} Station`,
        subtitle: stopSubtitle(s),
        icon: "uil:map-marker" as IconID,
        url: getStopPageRoute(getConfig(), s.id, null, null),
        tags: [],
        data: { stop: s.id },
        boost: 1.2,
      };
    })
  );

  return options;
}

/** Returns a search option for each line. */
export function searchOptionsLines(): SearchOption[] {
  const options: SearchOption[] = [];

  options.push(
    ...getConfig().shared.lines.map((l) => {
      return {
        title: `${l.name} Line`,
        subtitle: formatMode(l.serviceType, { capital: true, line: true }),
        icon: "uil:slider-h-range" as IconID,
        url: getLinePageRoute(getConfig(), l.id),
        tags: [],
        data: { line: l.id },
        boost: 1,
      };
    })
  );
  return options;
}

/** Returns a search option for each page on the site. */
export function searchOptionsWholeSite(): SearchOption[] {
  const options = [...searchOptionsStops(), ...searchOptionsLines()];

  // options.push({
  //   title: "Train map",
  //   subtitle: null,
  //   icon: "uil:map",
  //   url: "/map",
  //   tags: ["diagram", "interactive", "geographic", "location", "live"],
  //   data: null,
  //   boost: 0.6,
  // });

  options.push({
    title: "Lines",
    subtitle: null,
    icon: "uil:code-branch",
    url: "/lines",
    tags: ["network", "stops"],
    data: null,
    boost: 0.6,
  });

  options.push({
    title: "About",
    subtitle: null,
    icon: "uil:info-circle",
    url: "/about",
    tags: ["contact", "legal", "timetables", "github", "trainquery"],
    data: null,
    boost: 0.6,
  });

  options.push({
    title: "Settings",
    subtitle: null,
    icon: "uil:setting",
    url: "/settings",
    tags: [
      "options",
      "preferences",
      "setup",
      "theme",
      "dark",
      "light",
      "pinned",
      "widgets",
    ],
    data: null,
    boost: 0.6,
  });

  return options;
}

/** Returns the options (ranked) which best match the query. */
export function search(query: string, options: SearchOption[]): SearchOption[] {
  if (query.length == 0 || query.length > 50) {
    return [];
  }

  query = textify(query);
  const queryBits = query.split(" ");

  // Calculate a score for each option (to be ranked by)...
  const results = options.map((o) => {
    const title = textify(o.title);
    const titleBits = title.split(" ");

    // Baseline score - Overall similarity between the query and title. Allows
    // for misspelled words
    let score = similarity(query, title) * 2;

    // Add points for each word in the title matching being present in the query
    // too. Allows out of order words to still gain points (scaled to punish
    // longer titles).
    const titleBitsInQuery = titleBits.filter((q) =>
      queryBits.includes(q)
    ).length;
    score += (titleBitsInQuery / titleBits.length) * 2;

    // Add points for each word in the title being similar to a word in the
    // query. Allows for out of order and misspelled words to still gain points
    // (scaled to punish longer titles).
    titleBits.forEach((t) =>
      queryBits.forEach((q) => (score += similarity(q, t) / titleBits.length))
    );

    // Same as above, but for the tags (which gain less points).
    const tagsInQuery = o.tags.filter((q) => queryBits.includes(q)).length;
    score += tagsInQuery / titleBits.length;
    o.tags.forEach((t) =>
      queryBits.forEach((q) => (score += similarity(q, t) * 0.5))
    );

    // Some options are more likely to be searched for than others (e.g.
    // stations are more common than lines), so boost their scores.
    score *= o.boost;

    return {
      option: o,
      score: score,
    };
  });

  // Sort by score (descending).
  const sorted = results.sort((a, b) => -(a.score - b.score));

  // Options scoring half the score of the first choice, or hardly scoring
  // better than the 20th are eliminated.
  const threshold = Math.max(
    (sorted[0]?.score ?? 0) * 0.5,
    (sorted[20]?.score ?? 0) * 1.2
  );
  const mostRelevant = sorted.slice(0, 10).filter((r) => r.score >= threshold);

  // Return the list of options (strip the scores).
  return mostRelevant.map((r) => r.option);
}

/** Returns the same string, but trimmed and put in lowercase. */
function textify(str: string): string {
  return str.toLowerCase().trim();
}

/** Returns a score for how similar two strings are. */
function similarity(query: string, tag: string): number {
  let mismatch = 0;
  for (let i = 0; i < query.length; i++) {
    if (query[i] == tag[i]) {
      continue;
    }
    if (query[i] == tag[i - 1] || query[i] == tag[i + 1]) {
      mismatch += 0.8 * Math.pow(0.95, i);
      continue;
    }
    if (query[i] == tag[i - 2] || query[i] == tag[i + 2]) {
      mismatch += 0.9 * Math.pow(0.95, i);
      continue;
    }
    mismatch += 1 * Math.pow(0.95, i);
  }
  return 1 * Math.pow(0.75, mismatch);
}

function stopSubtitle(stop: Stop): string {
  const lineNames = linesThatStopAt(getConfig(), stop.id, {
    ignoreSpecialEventsOnlyLines: true,
    sortAlphabetically: true,
  }).map((l) => l.name);
  if (lineNames.length == 0) {
    return "No lines";
  }

  return `${listifyAnd(lineNames)} ${lineNames.length == 1 ? "Line" : "lines"}`;
}
