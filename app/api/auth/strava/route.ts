import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { setOAuthStateCookie } from "@/lib/session";
import { getStravaAuthorizeUrl } from "@/lib/strava";

export async function GET() {
  try {
    const state = randomBytes(24).toString("hex");
    await setOAuthStateCookie(state);
    return NextResponse.redirect(getStravaAuthorizeUrl(state));
  } catch (error) {
    console.error("Strava auth start failed:", error);
    return NextResponse.redirect(
      new URL("/?error=strava_config", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }
}
