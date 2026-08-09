import { NextResponse, type NextRequest } from "next/server";
import { userIdFromBearer } from "@/lib/steam/bearer";
import { confirmSteamVerificationFor } from "@/lib/steam/verify";

/** Mobile: confirm the Steam profile-code verification (bearer-authenticated). */
export async function POST(req: NextRequest) {
  const userId = await userIdFromBearer(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }
  const result = await confirmSteamVerificationFor(userId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
