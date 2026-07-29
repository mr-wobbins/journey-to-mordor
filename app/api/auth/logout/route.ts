import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base);
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.redirect(appUrl("/"), { status: 303 });
}

export async function GET() {
  await clearSessionCookie();
  return NextResponse.redirect(appUrl("/"));
}
