import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, font, glow, gradients } from "@/theme/tokens";

/** The signature accent hairline (transparent → accent-ring → transparent). */
export function Hairline() {
  return (
    <LinearGradient
      colors={["transparent", colors.accentRing, "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 1 }}
    />
  );
}

type PillTone = "neutral" | "accent" | "live" | "good" | "warning";
const PILL: Record<PillTone, { bg: string; border: string; fg: string }> = {
  neutral: { bg: colors.surface, border: colors.border, fg: colors.textMuted },
  accent: { bg: colors.accentSoft, border: colors.accentRing, fg: colors.accent },
  live: { bg: colors.liveSoft, border: "rgba(255,77,77,0.4)", fg: "#ff8a8a" },
  good: { bg: colors.goodSoft, border: "rgba(61,220,132,0.4)", fg: colors.good },
  warning: { bg: colors.warningSoft, border: "rgba(255,176,32,0.4)", fg: colors.warning },
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: PillTone }) {
  const t = PILL[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.pillText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

/** Pulsing live tag. */
export function LiveTag({ label = "LIVE" }: { label?: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={styles.liveTag}>
      <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
      <Text style={styles.liveText}>{label}</Text>
    </View>
  );
}

/** Condensed uppercase screen header with an accent kicker + accent hairline. */
export function ScreenHeader({
  title,
  kicker,
  right,
}: {
  title: string;
  kicker?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      <Hairline />
    </View>
  );
}

/** Sliding segmented control (e.g. For You / Following). */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const idx = Math.max(0, options.indexOf(value));
  const [w, setW] = useState(0);
  const anim = useRef(new Animated.Value(idx)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: idx, useNativeDriver: true, friction: 9, tension: 80 }).start();
  }, [idx, anim]);

  const seg = w > 0 ? (w - 6) / options.length : 0;
  const translateX = anim.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => i * seg),
  });

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.segmented}>
      {w > 0 && (
        <Animated.View style={[styles.segThumb, { width: seg, transform: [{ translateX }] }]}>
          <LinearGradient
            colors={gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={styles.segItem}>
          <Text style={[styles.segText, { color: value === o ? colors.onAccent : colors.textMuted }]}>
            {o}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Primary accent action — gradient fill + glow + dark-on-lime label. */
export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.gradBtn,
        glow.accent,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradBtnInner}
      >
        {loading ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <>
            {icon}
            <Text style={styles.gradBtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.liveSoft,
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.4)",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
  liveText: { color: "#ff8a8a", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  header: { backgroundColor: "rgba(12,15,12,0.92)" },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  kicker: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: 3,
  },
  headerTitle: {
    fontFamily: font.family.display,
    fontSize: 27,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: colors.text,
  },
  segmented: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    padding: 3,
  },
  segThumb: { position: "absolute", top: 3, bottom: 3, left: 3, borderRadius: 999, overflow: "hidden" },
  segItem: { flex: 1, paddingVertical: 7, alignItems: "center", zIndex: 1 },
  segText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  gradBtn: { borderRadius: 999, overflow: "hidden" },
  gradBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  gradBtnText: { color: colors.onAccent, fontWeight: "800", fontSize: font.size.md, letterSpacing: 0.3 },
});
