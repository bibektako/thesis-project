import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../services/admin";
import { colors } from "../theme/colors";

const AdminSubmissionsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { status, challengeId } = route.params || {};
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(status || "all");

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      const data = await getAllSubmissions(
        filter !== "all" ? filter : null,
        challengeId
      );
      setSubmissions(data);
    } catch (error) {
      console.error("Error loading submissions:", error);
      Alert.alert("Error", "Failed to load submissions");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubmissions();
  };

  const handleApprove = async (submissionId) => {
    try {
      await approveSubmission(submissionId);
      Alert.alert("Success", "Submission approved!");
      loadSubmissions();
    } catch (error) {
      Alert.alert("Error", "Failed to approve submission");
    }
  };

  const handleReject = (submissionId) => {
    Alert.alert(
      "Reject Submission",
      "Are you sure you want to reject this submission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectSubmission(submissionId, "Rejected by admin");
              Alert.alert("Success", "Submission rejected");
              loadSubmissions();
            } catch (error) {
              Alert.alert("Error", "Failed to reject submission");
            }
          },
        },
      ]
    );
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

  const renderSubmission = ({ item }) => (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionHeaderLeft}>
          <Text style={styles.username}>{item.username || "Unknown"}</Text>
          <Text style={styles.checkpointId}>{item.checkpoint_id}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusEmoji(item.status)}
            size={18}
            color={getStatusColor(item.status)}
            style={styles.statusEmoji}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.ocr && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} /> OCR:
          </Text>
          <Text style={styles.detailValue}>
            {item.ocr.match_score?.toFixed(1)}%
          </Text>
        </View>
      )}

      {item.gps && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} /> GPS:
          </Text>
          <Text style={styles.detailValue}>
            {item.gps.distance?.toFixed(1)}m
          </Text>
        </View>
      )}

      {item.face && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} /> Liveness:
          </Text>
          <Text style={styles.detailValue}>
            {(item.face.liveness_score * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      {item.points_awarded > 0 && (
        <Text style={styles.pointsAwarded}>
          +{item.points_awarded} points
        </Text>
      )}

      {item.status === "pending_admin" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.success, colors.secondaryDark]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.error, "#DC2626"]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filters = [
    { key: "all", label: "All" },
    { key: "pending_admin", label: "Pending" },
    { key: "verified", label: "Verified" },
    { key: "rejected", label: "Rejected" },
  ];

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
        colors={[colors.info, colors.primary]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Submissions</Text>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filterItem) => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterButton,
              filter === filterItem.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterItem.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterItem.key && styles.filterTextActive,
              ]}
            >
              {filterItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={submissions}
        renderItem={renderSubmission}
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
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No submissions found</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  filtersContainer: {
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textWhite,
  },
  list: {
    padding: 16,
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
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  checkpointId: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
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
  pointsAwarded: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.success,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  rejectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    padding: 14,
    alignItems: "center",
  },
  actionButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
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
  },
});

export default AdminSubmissionsScreen;

