import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { SteamButton } from "@/components/SteamButton";
import { ErrorText, Field, Heading, Muted, PrimaryButton, Screen } from "@/components/ui";
import { colors, spacing } from "@/theme/tokens";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setError(error);
    else router.replace("/(tabs)");
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center", padding: spacing.xl }}
      >
        <Heading>Welcome back</Heading>
        <Muted>Sign in to StrikersFeed.</Muted>
        <View style={{ height: spacing.xl }} />
        <SteamButton />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {error && <ErrorText>{error}</ErrorText>}
        <View style={{ height: spacing.md }} />
        <PrimaryButton title="Sign in" onPress={submit} loading={busy} disabled={!email || !password} />
        <View style={{ height: spacing.lg }} />
        <Link href="/(auth)/sign-up" style={{ color: colors.accent, textAlign: "center" }}>
          New here? Create an account
        </Link>
      </KeyboardAvoidingView>
    </Screen>
  );
}
