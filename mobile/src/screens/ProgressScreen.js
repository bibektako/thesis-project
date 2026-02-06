import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";
import useAuthStore from "../state/useAuthStore";
import { colors } from "../theme/colors";

const ProgressScreen = () => {
  const route = useRoute();
  const { challengeId } = route.params || {};
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const params = challengeId ? `?challenge_id=${challengeId}` : "";
      const response = await api.get(`/api/submissions${params}`);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return colors.success;
      case "rejected":
        return colors.error;
      case "pending_admin":
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "verified":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "pending_admin":
        return "time-outline";
      default:
        return "document-text-outline";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Progress</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Total Points</Text>
            <Text style={styles.pointsValue}>{user?.points || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={56} color={colors.textSecondary} style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Start a challenge to see your progress here!
            </Text>
          </View>
        ) : (
          submissions.map((submission, index) => (
            <View key={submission.id || index} style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <View style={styles.submissionHeaderLeft}>
                  <Text style={styles.checkpointId}>
                    {submission.checkpoint_id}
                  </Text>
                  <Text style={styles.submissionDate}>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(submission.status) + "20" },
                  ]}
                >
                  <Ionicons
                    name={getStatusEmoji(submission.status)}
                    size={18}
                    color={getStatusColor(submission.status)}
                    style={styles.statusEmoji}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(submission.status) },
                    ]}
                  >
                    {submission.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {submission.ocr && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📝 OCR Score:</Text>
                  <Text style={styles.detailValue}>
                    {submission.ocr.match_score?.toFixed(1)}%
                  </Text>
                </View>
              )}

              {submission.gps && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 GPS Distance:</Text>
                  <Text style={styles.detailValue}>
                    {submission.gps.distance?.toFixed(1)}m
                  </Text>
                </View>
              )}

              {submission.face && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🤳 Liveness Score:</Text>
                  <Text style={styles.detailValue}>
                    {(submission.face.liveness_score * 100).toFixed(1)}%
                  </Text>
                </View>
              )}

              {submission.points_awarded > 0 && (
                <View style={styles.pointsAwardedContainer}>
                  <LinearGradient
                    colors={[colors.success, colors.secondaryDark]}
                    style={styles.pointsBadge}
                  >
                    <Text style={styles.pointsAwardedText}>
                      +{submission.points_awarded} points
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          ))
        )}
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
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  pointsContainer: {
    backgroundColor: colors.backgroundLight + "30",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textWhite + "CC",
    fontWeight: "500",
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textWhite,
  },
  content: {
    padding: 20,
  },
  submissionCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  submissionHeaderLeft: {
    flex: 1,
  },
  checkpointId: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pointsAwardedContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  pointsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pointsAwardedText: {
    color: colors.textWhite,
    fontSize: 16,
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

export default ProgressScreen;
