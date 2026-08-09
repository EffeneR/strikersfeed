import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { SteamButton } from "@/components/SteamButton";
import { ErrorText, Field, Heading, Muted, PrimaryButton, Screen } from "@/components/ui";
import { colors, spacing } from "@/theme/tokens";

export default function SignUp() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error, needsConfirmation } = await signUp(email.trim(), password, displayName.trim());
    setBusy(false);
    if (error) setError(error);
    else if (needsConfirmation) setInfo("Check your email to confirm, then sign in.");
    else router.replace("/(tabs)");
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center", padding: spacing.xl }}
      >
        <Heading>Join StrikersFeed</Heading>
        <Muted>Create your account to join the community.</Muted>
        <View style={{ height: spacing.xl }} />
        <SteamButton />
        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your gamer tag" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a password" />
        {error && <ErrorText>{error}</ErrorText>}
        {info && <Muted>{info}</Muted>}
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          title="Create account"
          onPress={submit}
          loading={busy}
          disabled={!email || !password || !displayName}
        />
        <View style={{ height: spacing.lg }} />
        <Link href="/(auth)/sign-in" style={{ color: colors.accent, textAlign: "center" }}>
          Already have an account? Sign in
        </Link>
      </KeyboardAvoidingView>
    </Screen>
  );
}
