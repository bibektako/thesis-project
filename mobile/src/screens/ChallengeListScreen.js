import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getChallenges } from "../services/challenges";
import useAuthStore from "../state/useAuthStore";
import { colors } from "../theme/colors";

const ChallengeListScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = async () => {
    try {
      const data = await getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  const renderChallenge = ({ item, index }) => {
    const gradientColors = [
      [colors.primary, colors.primaryDark],
      [colors.secondary, colors.secondaryDark],
      [colors.accent, "#F97316"],
    ][index % 3];

    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() =>
          navigation.navigate("ChallengeDetail", { challengeId: item.id })
        }
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {item.checkpoints?.length || 0} Checkpoints
                </Text>
              </View>
              <Ionicons
                name={
                  index % 3 === 0
                    ? "trail-sign-outline"
                    : index % 3 === 1
                    ? "leaf-outline"
                    : "sunny-outline"
                }
                size={32}
                color={colors.textWhite}
                style={styles.cardEmoji}
              />
            </View>
            <Text style={styles.challengeTitle}>{item.title}</Text>
            <Text style={styles.challengeDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.pointsText}>
                {item.points_per_checkpoint || 10} pts per checkpoint
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textWhite} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Challenges</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back, {user?.username}!
            </Text>
          </View>
          <View style={styles.headerRight}>
            {user?.role === "admin" && (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate("AdminDashboard")}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={16} color={colors.textWhite} />
                <Text style={styles.adminButtonText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.textWhite} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trail-sign-outline" size={56} color={colors.textSecondary} style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>No challenges available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new adventures!
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textWhite + "CC",
    fontWeight: "500",
  },
  adminButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  adminButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: colors.error + "CC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeContainer: {
    backgroundColor: colors.backgroundLight + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: "700",
  },
  cardEmoji: {
    fontSize: 32,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  challengeDescription: {
    fontSize: 15,
    color: colors.textWhite + "DD",
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 14,
    color: colors.textWhite + "CC",
    fontWeight: "600",
  },
  arrow: {
    fontSize: 20,
    color: colors.textWhite,
    fontWeight: "700",
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

export default ChallengeListScreen;
