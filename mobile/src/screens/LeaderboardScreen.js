import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import api from "../services/api";
import { colors } from "../theme/colors";

const LeaderboardScreen = () => {
  const route = useRoute();
  const { challengeId } = route.params || {};
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await api.get(
        `/api/leaderboard/${challengeId || "all"}`
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const getRankColor = (index) => {
    if (index === 0) return colors.accent;
    if (index === 1) return colors.textSecondary;
    if (index === 2) return "#CD7F32";
    return colors.primary;
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const rankEmoji = getRankEmoji(index);
    const rankColor = getRankColor(index);

    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          {rankEmoji ? (
            <Text style={styles.rankEmoji}>{rankEmoji}</Text>
          ) : (
            <LinearGradient
              colors={[rankColor, rankColor + "DD"]}
              style={styles.rankBadge}
            >
              <Text style={styles.rank}>{index + 1}</Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username || "User"}</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Points</Text>
            <Text style={styles.points}>{item.points || 0}</Text>
          </View>
        </View>
        {index < 3 && (
          <View style={styles.trophyContainer}>
            <Text style={styles.trophy}>🏆</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accent, "#F97316"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top Performers</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyText}>No leaderboard data available</Text>
            <Text style={styles.emptySubtext}>
              Complete challenges to appear on the leaderboard!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    width: "100%",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textWhite + "CC",
    fontWeight: "500",
  },
  list: {
    padding: 16,
  },
  leaderboardItem: {
    backgroundColor: colors.backgroundLight,
    flexDirection: "row",
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rankContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rankBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  rank: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: "700",
  },
  rankEmoji: {
    fontSize: 40,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginRight: 8,
    fontWeight: "500",
  },
  points: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  trophyContainer: {
    marginLeft: 12,
  },
  trophy: {
    fontSize: 32,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
});

export default LeaderboardScreen;
