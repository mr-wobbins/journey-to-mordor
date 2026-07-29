import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOAuthStateCookie, setSessionCookie } from "@/lib/session";
import {
  athleteDisplayName,
  exchangeStravaCode,
  StravaRateLimitError,
} from "@/lib/strava";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) {
    return NextResponse.redirect(appUrl("/?error=strava_denied"));
  }

  const expectedState = await consumeOAuthStateCookie();
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(appUrl("/?error=strava_state"));
  }

  try {
    const token = await exchangeStravaCode(code);
    const athlete = token.athlete;
    if (!athlete?.id) {
      return NextResponse.redirect(appUrl("/?error=strava_athlete"));
    }

    const name = athleteDisplayName(athlete);
    const avatarUrl = athlete.profile || athlete.profile_medium || null;

    const user = await prisma.user.upsert({
      where: { stravaAthleteId: athlete.id },
      create: {
        stravaAthleteId: athlete.id,
        name,
        avatarUrl,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(token.expires_at * 1000),
      },
      update: {
        name,
        avatarUrl,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(token.expires_at * 1000),
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.redirect(appUrl("/dashboard"));
  } catch (err) {
    console.error("Strava callback failed:", err);
    if (err instanceof StravaRateLimitError) {
      return NextResponse.redirect(appUrl("/?error=strava_rate_limit"));
    }
    return NextResponse.redirect(appUrl("/?error=strava_callback"));
  }
}
