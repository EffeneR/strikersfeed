import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = url.length > 0 && anonKey.length > 0;

/**
 * SecureStore-backed session storage. Sensitive session tokens live in the
 * device keychain/keystore, not plain AsyncStorage. SecureStore has a ~2KB value
 * limit; Supabase sessions fit comfortably.
 */
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// `createClient` throws synchronously on an empty URL/key. Because this module is
// imported by the root layout, an empty config would crash the app on launch
// (native splash → instant close). Fall back to a harmless placeholder so the app
// always boots; `isSupabaseConfigured` then gates any real backend use.
export const supabase = createClient(
  url || "https://unconfigured.supabase.co",
  anonKey || "unconfigured-anon-key",
  {
    auth: {
      // SecureStore isn't available on web; fall back to default there.
      storage: Platform.OS === "web" ? undefined : SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
