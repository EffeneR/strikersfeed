import { StyleSheet, Text, View } from "react-native";
import type { CrestTone } from "@/data/demo";
import { colors } from "@/theme/tokens";

const TONES: Record<CrestTone, { bg: string; fg: string }> = {
  blue: { bg: "#1e2a4a", fg: "#8fb3ff" },
  violet: { bg: "#2a1e4a", fg: "#c4a8ff" },
  accent: { bg: "rgba(182,255,46,0.16)", fg: colors.accent },
};

/** Small rounded team crest with a tag/initials. */
export function Crest({ tag, tone = "blue", size = 40 }: { tag: string; tone?: CrestTone; size?: number }) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: t.bg },
      ]}
    >
      <Text style={{ color: t.fg, fontWeight: "800", fontSize: size * 0.3 }}>{tag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
