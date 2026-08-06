import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius } from "@/theme/tokens";

/** Round avatar with an initials fallback. */
export function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const dim = { width: size, height: size, borderRadius: radius.pill };
  if (url) return <Image source={{ uri: url }} style={dim} contentFit="cover" />;
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={[dim, styles.fallback]}>
      <Text style={{ color: colors.accent, fontWeight: "700", fontSize: size * 0.34 }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center" },
});
