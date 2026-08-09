import { NextResponse, type NextRequest } from "next/server";
import { userIdFromBearer } from "@/lib/steam/bearer";
import { unlinkSteamFor } from "@/lib/steam/verify";

/** Mobile: unlink the connected Steam account (bearer-authenticated). */
export async function POST(req: NextRequest) {
  const userId = await userIdFromBearer(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }
  const result = await unlinkSteamFor(userId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
