import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

function makeInviteCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

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
    action?: unknown;
    name?: unknown;
    inviteCode?: unknown;
  };

  const action = payload.action;

  if (action === "create") {
    const name =
      typeof payload.name === "string" && payload.name.trim()
        ? payload.name.trim().slice(0, 80)
        : "The Fellowship";

    const existing = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { fellowship: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Already in a fellowship",
          fellowship: existing.fellowship,
        },
        { status: 409 }
      );
    }

    let inviteCode = makeInviteCode();
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.fellowship.findUnique({ where: { inviteCode } });
      if (!clash) break;
      inviteCode = makeInviteCode();
    }

    const fellowship = await prisma.fellowship.create({
      data: {
        name,
        inviteCode,
        memberships: {
          create: { userId: user.id },
        },
      },
    });

    return NextResponse.json({ ok: true, fellowship });
  }

  if (action === "join") {
    const inviteCode =
      typeof payload.inviteCode === "string"
        ? payload.inviteCode.trim().toUpperCase()
        : "";

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code required" }, { status: 400 });
    }

    const fellowship = await prisma.fellowship.findUnique({
      where: { inviteCode },
    });
    if (!fellowship) {
      return NextResponse.json({ error: "Fellowship not found" }, { status: 404 });
    }

    const existing = await prisma.membership.findFirst({
      where: { userId: user.id },
    });
    if (existing) {
      if (existing.fellowshipId === fellowship.id) {
        return NextResponse.json({ ok: true, fellowship });
      }
      return NextResponse.json(
        { error: "Leave your current fellowship before joining another" },
        { status: 409 }
      );
    }

    await prisma.membership.create({
      data: {
        userId: user.id,
        fellowshipId: fellowship.id,
      },
    });

    return NextResponse.json({ ok: true, fellowship });
  }

  if (action === "leave") {
    await prisma.membership.deleteMany({
      where: { userId: user.id },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
