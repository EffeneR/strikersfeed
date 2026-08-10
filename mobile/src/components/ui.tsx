import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "./design";
import { colors, font, radius, spacing } from "@/theme/tokens";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      {children}
    </SafeAreaView>
  );
}

/** Condensed uppercase display heading (Barlow). */
export function Heading({ children }: { children: ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return <GradientButton title={title} onPress={onPress} loading={loading} disabled={disabled} />;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  heading: {
    color: colors.text,
    fontFamily: font.family.display,
    fontSize: 34,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  muted: { color: colors.textMuted, fontSize: font.size.md },
  label: { color: colors.text, fontSize: font.size.sm, fontWeight: "500", marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: font.size.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  error: { color: colors.live, fontSize: font.size.sm, marginTop: 4 },
});
