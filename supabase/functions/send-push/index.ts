// StrikersFeed — `send-push` Edge Function
//
// Sends an Expo push notification to the author of a post when someone replies
// to it. Intended to be triggered by a Supabase **Database Webhook** on INSERT
// into `public.comments` (Dashboard → Database → Webhooks). The webhook posts
// `{ type, table, record, old_record }`; we read the new comment, find the post
// author, respect their notification prefs, and push to their devices.
//
// Uses the service-role key (auto-injected) to read across users' rows. Set an
// optional shared secret to reject spoofed calls:
//   supabase secrets set PUSH_WEBHOOK_SECRET=<random>
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

  let payload: { type?: string; record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const comment = payload.record;
  if (!comment || typeof comment.post_id !== "string" || typeof comment.author_id !== "string") {
    return json({ skipped: "not a comment insert" });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Who owns the post?
  const { data: post } = await admin
    .from("posts")
    .select("author_id")
    .eq("id", comment.post_id)
    .maybeSingle();
  const recipientId = post?.author_id as string | undefined;
  if (!recipientId || recipientId === comment.author_id) {
    return json({ skipped: "no recipient / self-reply" });
  }

  // Respect the recipient's reply preference (default on).
  const { data: prefs } = await admin
    .from("notification_prefs")
    .select("replies")
    .eq("user_id", recipientId)
    .maybeSingle();
  if (prefs && prefs.replies === false) return json({ skipped: "replies disabled" });

  // Fetch the replier's handle for a nicer message.
  const { data: replier } = await admin
    .from("profiles")
    .select("username, display_name")
    .eq("id", comment.author_id)
    .maybeSingle();
  const who = replier?.display_name ?? replier?.username ?? "Someone";

  // Recipient's device tokens.
  const { data: tokens } = await admin
    .from("device_tokens")
    .select("token")
    .eq("user_id", recipientId);
  if (!tokens || tokens.length === 0) return json({ skipped: "no devices" });

  const messages = tokens.map((t) => ({
    to: (t as { token: string }).token,
    sound: "default",
    title: `${who} replied to your post`,
    body: String(comment.body ?? "").slice(0, 140),
    data: { postId: comment.post_id },
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
