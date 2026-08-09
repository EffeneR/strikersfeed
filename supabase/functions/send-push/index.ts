// StrikersFeed — `send-push` Edge Function
//
// Sends an Expo push when a notification is created. Triggered by a Supabase
// **Database Webhook** on INSERT into `public.notifications` (Dashboard →
// Database → Webhooks → the send-push function). The webhook posts
// `{ type: "INSERT", table, record, old_record }`; we read the notification,
// format a message for its type (reply / reaction / follow), respect the
// recipient's notification prefs, and push to their devices via Expo.
//
// Uses the service-role key (auto-injected). Optional shared secret to reject
// spoofed calls:  supabase secrets set PUSH_WEBHOOK_SECRET=<random>
// then add header `x-webhook-secret: <random>` to the webhook.
//
// Deploy:  supabase functions deploy send-push --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const n = payload.record;
  if (!n || typeof n.user_id !== "string" || typeof n.type !== "string") {
    return json({ skipped: "not a notification insert" });
  }

  const recipientId = n.user_id as string;
  const actorId = (n.actor_id as string) ?? null;
  const type = n.type as string;
  if (actorId && actorId === recipientId) return json({ skipped: "self" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Respect the recipient's per-type preference (default on).
  const { data: prefs } = await admin
    .from("notification_prefs")
    .select("replies, follows")
    .eq("user_id", recipientId)
    .maybeSingle();
  if (prefs) {
    if (type === "reply" && prefs.replies === false) return json({ skipped: "replies off" });
    if (type === "follow" && prefs.follows === false) return json({ skipped: "follows off" });
  }

  // Actor's name for a nicer message.
  let who = "Someone";
  if (actorId) {
    const { data: actor } = await admin
      .from("profiles")
      .select("username, display_name")
      .eq("id", actorId)
      .maybeSingle();
    who = (actor?.display_name as string) ?? (actor?.username as string) ?? "Someone";
  }

  const title =
    type === "reply"
      ? `${who} replied to your post`
      : type === "reaction"
        ? `${who} liked your post`
        : `${who} started following you`;

  const { data: tokens } = await admin
    .from("device_tokens")
    .select("token")
    .eq("user_id", recipientId);
  if (!tokens || tokens.length === 0) return json({ skipped: "no devices" });

  const messages = tokens.map((t) => ({
    to: (t as { token: string }).token,
    sound: "default",
    title,
    data: { type, postId: (n.post_id as string) ?? null, actorId },
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });

  return json({ sent: messages.length, expoStatus: res.status });
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
