import { NextRequest, NextResponse } from "next/server";
import { ActivitySource } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    miles?: unknown;
    name?: unknown;
    date?: unknown;
  };

  const miles = typeof payload.miles === "number" ? payload.miles : Number(payload.miles);
  if (!Number.isFinite(miles) || miles <= 0 || miles > 200) {
    return NextResponse.json(
      { error: "Miles must be a number between 0 and 200" },
      { status: 400 }
    );
  }

  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim().slice(0, 120)
      : "Manual miles";

  let startedAt = new Date();
  if (typeof payload.date === "string" && payload.date) {
    const parsed = new Date(payload.date);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    startedAt = parsed;
  }

  const activity = await prisma.activity.create({
    data: {
      userId: user.id,
      source: ActivitySource.MANUAL,
      sportType: "Manual",
      name,
      distanceMiles: miles,
      startedAt,
    },
  });

  return NextResponse.json({
    ok: true,
    activity: {
      id: activity.id,
      name: activity.name,
      distanceMiles: activity.distanceMiles,
      startedAt: activity.startedAt.toISOString(),
      source: activity.source,
    },
  });
}
