import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearInviteCookie, setInviteCookie } from "@/lib/session";

type InviteRouteProps = {
  params: Promise<{ code: string }>;
};

function appUrl(path: string) {
  return new URL(
    path,
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  );
}

export async function GET(_request: NextRequest, { params }: InviteRouteProps) {
  const { code } = await params;
  const inviteCode = code.trim().toUpperCase();
  const fellowship = await prisma.fellowship.findUnique({
    where: { inviteCode },
  });

  if (!fellowship) {
    return NextResponse.redirect(appUrl("/?error=invalid_invite"));
  }

  const user = await getCurrentUser();
  if (!user) {
    await setInviteCookie(inviteCode);
    return NextResponse.redirect(appUrl("/api/auth/strava"));
  }

  const existing = await prisma.membership.findFirst({
    where: { userId: user.id },
  });
  if (!existing) {
    await prisma.membership.create({
      data: { userId: user.id, fellowshipId: fellowship.id },
    });
  }

  await clearInviteCookie();
  return NextResponse.redirect(appUrl("/fellowship"));
}
