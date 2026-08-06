import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Show incoming notifications while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPrefs {
  matchStart: boolean;
  mentions: boolean;
  replies: boolean;
  follows: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { matchStart: true, mentions: true, replies: true, follows: true };

export async function getPrefs(): Promise<NotificationPrefs> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PREFS;
  const { data } = await supabase
    .from("notification_prefs")
    .select("match_start, mentions, replies, follows")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return DEFAULT_PREFS;
  return {
    matchStart: data.match_start ?? true,
    mentions: data.mentions ?? true,
    replies: data.replies ?? true,
    follows: data.follows ?? true,
  };
}

export async function setPrefs(prefs: NotificationPrefs): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };
  const { error } = await supabase.from("notification_prefs").upsert(
    {
      user_id: user.id,
      match_start: prefs.matchStart,
      mentions: prefs.mentions,
      replies: prefs.replies,
      follows: prefs.follows,
    },
    { onConflict: "user_id" },
  );
  return { error: error?.message };
}

function easProjectId(): string | null {
  const id = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  if (!id || id.startsWith("REPLACE")) return null;
  return id;
}

/**
 * Register this device for push: ask permission, fetch the Expo push token and
 * store it on the user's row. Best-effort and safe to call after sign-in — it
 * no-ops silently if permission is denied or the EAS projectId isn't set yet
 * (i.e. before `eas init`).
 */
export async function registerForPush(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return;

    const projectId = easProjectId();
    if (!projectId) return; // token requires a real EAS project id

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("device_tokens").upsert(
      { user_id: user.id, token, platform: Platform.OS === "ios" ? "ios" : "android" },
      { onConflict: "token" },
    );
  } catch {
    // Push is a nice-to-have; never block the app on it.
  }
}
