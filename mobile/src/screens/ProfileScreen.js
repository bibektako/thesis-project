import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import useAuthStore from "../state/useAuthStore";
import { getBadgesCatalog } from "../services/challenges";
import { colors } from "../theme/colors";

const DEFAULT_GRADIENT = ["#6366F1", "#8B5CF6"];

const ProfileScreen = () => {
  const { user, refreshUser } = useAuthStore();
  const [catalog, setCatalog] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const cardSize = (width - 48) / 2 - 8;

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await getBadgesCatalog();
      setCatalog(data || {});
    } catch (e) {
      console.warn("Badges catalog load failed:", e?.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadCatalog();
    setRefreshing(false);
  };

  const badges = user?.badges || [];
  const list = badges.map((b) => {
    const info = catalog[b.badge_id] || {};
    return {
      ...b,
      name: info.name || b.badge_id,
      description: info.description || "",
      icon: info.icon || "ribbon",
      gradient: info.gradient || DEFAULT_GRADIENT,
    };
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.username}>{user?.username || "—"}</Text>
        <View style={styles.pointsRow}>
          <Ionicons name="star" size={20} color={colors.accentLight} />
          <Text style={styles.points}>{user?.points ?? 0} points</Text>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Badges</Text>
        </View>
        {list.length === 0 ? (
          <View style={styles.emptyBadges}>
            <Ionicons name="ribbon-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No badges yet</Text>
            <Text style={styles.emptySub}>
              Complete checkpoints or use Safe Exit to earn badges.
            </Text>
          </View>
        ) : (
          <View style={styles.badgeGrid}>
            {list.map((badge, index) => (
              <View key={`${badge.badge_id}-${index}`} style={[styles.badgeCard, { width: cardSize }]}>
                <LinearGradient
                  colors={badge.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}
                >
                  <View style={styles.badgeIconWrap}>
                    <Ionicons name={badge.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                  {badge.challenge_title ? (
                    <Text style={styles.badgeChallenge} numberOfLines={1}>
                      {badge.challenge_title}
                    </Text>
                  ) : null}
                </LinearGradient>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textWhite,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  points: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accentLight,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyBadges: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 8,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  badgeCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  badgeGradient: {
    padding: 16,
    minHeight: 140,
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 14,
  },
  badgeChallenge: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
  },
});

export default ProfileScreen;
