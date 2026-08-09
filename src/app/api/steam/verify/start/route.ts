import { NextResponse, type NextRequest } from "next/server";
import { userIdFromBearer } from "@/lib/steam/bearer";
import { startSteamVerificationFor } from "@/lib/steam/verify";

/** Mobile: start a Steam profile-code verification (bearer-authenticated). */
export async function POST(req: NextRequest) {
  const userId = await userIdFromBearer(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { steamInput?: unknown };
  const steamInput = typeof body.steamInput === "string" ? body.steamInput : "";
  const result = await startSteamVerificationFor(userId, steamInput);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
