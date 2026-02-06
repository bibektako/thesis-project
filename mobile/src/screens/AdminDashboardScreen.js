import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAdminStats } from "../services/admin";
import { colors } from "../theme/colors";

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total_users || 0,
      color: colors.primary,
      icon: "people-outline",
      screen: "AdminUsers",
    },
    {
      label: "Challenges",
      value: stats?.total_challenges || 0,
      color: colors.secondary,
      icon: "trail-sign-outline",
      screen: "AdminChallenges",
    },
    {
      label: "Submissions",
      value: stats?.total_submissions || 0,
      color: colors.info,
      icon: "document-text-outline",
      screen: "AdminSubmissions",
    },
    {
      label: "Pending Review",
      value: stats?.pending_submissions || 0,
      color: colors.warning,
      icon: "time-outline",
      screen: "AdminSubmissions",
      params: { status: "pending_admin" },
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.accent, "#F97316"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textWhite} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage your platform</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={() =>
                navigation.navigate(stat.screen, stat.params || {})
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[stat.color, stat.color + "DD"]}
                style={styles.statCardGradient}
              >
                <Ionicons name={stat.icon} size={32} color={colors.textWhite} style={styles.statIcon} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AdminCreateChallenge")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.textWhite} style={styles.actionIcon} />
              <Text style={styles.actionText}>Create Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("AdminSubmissions", {
                status: "pending_admin",
              })
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.warning, "#F59E0B"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="time-outline" size={24} color={colors.textWhite} style={styles.actionIcon} />
              <Text style={styles.actionText}>Review Pending</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textWhite + "DD",
    fontWeight: "500",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    padding: 20,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textWhite + "CC",
    fontWeight: "600",
    textAlign: "center",
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AdminDashboardScreen;





