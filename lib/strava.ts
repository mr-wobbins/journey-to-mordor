import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export const FOOT_SPORT_TYPES = new Set([
  "Walk",
  "Run",
  "Hike",
  "TrailRun",
  "VirtualRun",
  "Snowshoe",
]);

export const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
export const SYNC_PER_PAGE = 50;
export const SYNC_MAX_PAGES = 5;

export type StravaTokenResponse = {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  athlete?: {
    id: number;
    firstname?: string;
    lastname?: string;
    profile?: string;
    profile_medium?: string;
  };
};

export type StravaActivity = {
  id: number;
  name: string;
  distance: number;
  type: string;
  sport_type?: string;
  start_date: string;
  start_date_local?: string;
};

export class StravaRateLimitError extends Error {
  constructor(message = "Strava is busy — try again later") {
    super(message);
    this.name = "StravaRateLimitError";
  }
}

export class StravaApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StravaApiError";
    this.status = status;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function getStravaRedirectUri(): string {
  return (
    process.env.STRAVA_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/strava/callback`
  );
}

export function getStravaAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("STRAVA_CLIENT_ID"),
    redirect_uri: getStravaRedirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state,
  });
  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("STRAVA_CLIENT_ID"),
      client_secret: requireEnv("STRAVA_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
    }),
  });

  if (res.status === 429) throw new StravaRateLimitError();
  if (!res.ok) {
    const text = await res.text();
    throw new StravaApiError(res.status, `Token exchange failed: ${text}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

async function refreshStravaToken(user: User): Promise<User> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("STRAVA_CLIENT_ID"),
      client_secret: requireEnv("STRAVA_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: user.refreshToken,
    }),
  });

  if (res.status === 429) throw new StravaRateLimitError();
  if (!res.ok) {
    const text = await res.text();
    throw new StravaApiError(res.status, `Token refresh failed: ${text}`);
  }

  const data = (await res.json()) as StravaTokenResponse;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at * 1000),
    },
  });
}

export async function getValidAccessToken(user: User): Promise<{ user: User; accessToken: string }> {
  const expiresSoon = user.expiresAt.getTime() <= Date.now() + 60_000;
  if (!expiresSoon) {
    return { user, accessToken: user.accessToken };
  }

  const refreshed = await refreshStravaToken(user);
  return { user: refreshed, accessToken: refreshed.accessToken };
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

export function isFootActivity(activity: StravaActivity): boolean {
  const sport = activity.sport_type || activity.type;
  return FOOT_SPORT_TYPES.has(sport);
}

export async function fetchAthleteActivities(
  accessToken: string,
  afterEpochSeconds: number
): Promise<StravaActivity[]> {
  const activities: StravaActivity[] = [];

  for (let page = 1; page <= SYNC_MAX_PAGES; page++) {
    const params = new URLSearchParams({
      after: String(afterEpochSeconds),
      page: String(page),
      per_page: String(SYNC_PER_PAGE),
    });

    const res = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 429) throw new StravaRateLimitError();
    if (!res.ok) {
      const text = await res.text();
      throw new StravaApiError(res.status, `Activities fetch failed: ${text}`);
    }

    const batch = (await res.json()) as StravaActivity[];
    activities.push(...batch);

    if (batch.length < SYNC_PER_PAGE) break;
  }

  return activities;
}

export function athleteDisplayName(
  athlete: NonNullable<StravaTokenResponse["athlete"]>
): string {
  const parts = [athlete.firstname, athlete.lastname].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : `Athlete ${athlete.id}`;
}
