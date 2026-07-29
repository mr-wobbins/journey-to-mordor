import { NextResponse } from "next/server";
import { ActivitySource } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fetchAthleteActivities,
  getValidAccessToken,
  isFootActivity,
  metersToMiles,
  StravaRateLimitError,
  SYNC_COOLDOWN_MS,
} from "@/lib/strava";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.lastSyncedAt) {
    const elapsed = Date.now() - user.lastSyncedAt.getTime();
    if (elapsed < SYNC_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        {
          error: "Sync cooldown active. Try again shortly.",
          retryAfterSeconds,
        },
        { status: 429 },
      );
    }
  }

  try {
    const { user: authedUser, accessToken } = await getValidAccessToken(user);

    // Never import activities from before the athlete joined this app.
    // After the initial sync, only request activities newer than the last sync.
    const syncAfter = authedUser.lastSyncedAt ?? authedUser.createdAt;
    const afterEpoch = Math.floor(syncAfter.getTime() / 1000);

    const activities = await fetchAthleteActivities(accessToken, afterEpoch);
    const footActivities = activities.filter(isFootActivity);

    let upserted = 0;
    for (const activity of footActivities) {
      const distanceMiles = metersToMiles(activity.distance);
      if (distanceMiles <= 0) continue;

      await prisma.activity.upsert({
        where: { stravaId: BigInt(activity.id) },
        create: {
          userId: authedUser.id,
          source: ActivitySource.STRAVA,
          stravaId: BigInt(activity.id),
          sportType: activity.sport_type || activity.type,
          name: activity.name || "Strava activity",
          distanceMiles,
          startedAt: new Date(activity.start_date),
        },
        update: {
          sportType: activity.sport_type || activity.type,
          name: activity.name || "Strava activity",
          distanceMiles,
          startedAt: new Date(activity.start_date),
        },
      });
      upserted += 1;
    }

    await prisma.user.update({
      where: { id: authedUser.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      fetched: activities.length,
      footActivities: footActivities.length,
      upserted,
    });
  } catch (error) {
    console.error("Strava sync failed:", error);
    if (error instanceof StravaRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json(
      { error: "Failed to sync with Strava" },
      { status: 500 },
    );
  }
}
