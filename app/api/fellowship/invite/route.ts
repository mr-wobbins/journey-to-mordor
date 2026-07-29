import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendInviteSms } from "@/lib/twilio";

export const runtime = "nodejs";

const E164_PHONE = /^\+[1-9]\d{7,14}$/;
const MAX_INVITES_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { fellowship: true },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "Create or join a fellowship first" },
      { status: 400 },
    );
  }

  let phone: string;
  try {
    const body = (await request.json()) as { phone?: unknown };
    phone =
      typeof body.phone === "string" ? body.phone.replace(/[\s()-]/g, "") : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!E164_PHONE.test(phone)) {
    return NextResponse.json(
      { error: "Enter a phone number with country code, such as +15551234567" },
      { status: 400 },
    );
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
  const phoneHash = createHash("sha256").update(phone).digest("hex");

  const [recentSenderCount, duplicate] = await Promise.all([
    prisma.smsInvite.count({
      where: { sentById: user.id, createdAt: { gte: oneHourAgo } },
    }),
    prisma.smsInvite.findFirst({
      where: {
        fellowshipId: membership.fellowshipId,
        phoneHash,
        createdAt: { gte: tenMinutesAgo },
      },
    }),
  ]);

  if (recentSenderCount >= MAX_INVITES_PER_HOUR) {
    return NextResponse.json(
      { error: "Invite limit reached. Try again in an hour." },
      { status: 429 },
    );
  }
  if (duplicate) {
    return NextResponse.json(
      { error: "An invite was already sent to that number recently." },
      { status: 429 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: "Invite links are not configured" },
      { status: 500 },
    );
  }

  const inviteUrl = new URL(
    `/api/invite/${encodeURIComponent(membership.fellowship.inviteCode)}`,
    appUrl,
  ).toString();
  const messageBody = `${user.name} invited you to join “${membership.fellowship.name}” on Journey to Mordor. Connect Strava and join the fellowship: ${inviteUrl}`;

  try {
    const message = await sendInviteSms(phone, messageBody);
    await prisma.smsInvite.create({
      data: {
        fellowshipId: membership.fellowshipId,
        sentById: user.id,
        phoneHash,
        twilioSid: message.sid,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const details =
      error && typeof error === "object"
        ? {
            name: "name" in error ? error.name : "TwilioError",
            code: "code" in error ? error.code : undefined,
            status: "status" in error ? error.status : undefined,
          }
        : { name: "TwilioError" };
    console.error("Twilio invite failed:", details);
    return NextResponse.json(
      { error: "The text could not be sent. Check the Twilio configuration." },
      { status: 502 },
    );
  }
}
