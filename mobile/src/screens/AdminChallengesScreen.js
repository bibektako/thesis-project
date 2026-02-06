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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getAllChallengesAdmin,
  deleteChallenge,
} from "../services/admin";
import { colors } from "../theme/colors";

const AdminChallengesScreen = () => {
  const navigation = useNavigation();
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await getAllChallengesAdmin();
      setChallenges(data);
    } catch (error) {
      console.error("Error loading challenges:", error);
      Alert.alert("Error", "Failed to load challenges");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleDelete = (challengeId, title) => {
    Alert.alert(
      "Delete Challenge",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChallenge(challengeId);
              Alert.alert("Success", "Challenge deleted");
              loadChallenges();
            } catch (error) {
              Alert.alert("Error", "Failed to delete challenge");
            }
          },
        },
      ]
    );
  };

  const renderChallenge = ({ item }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() =>
        navigation.navigate("AdminEditChallenge", { challengeId: item.id })
      }
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeMeta}>
            {item.checkpoints?.length || 0} checkpoints •{" "}
            {item.points_per_checkpoint || 10} pts each
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.is_active
              ? styles.statusBadgeActive
              : styles.statusBadgeInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.is_active ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {item.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
      <Text style={styles.challengeDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("AdminEditChallenge", { challengeId: item.id })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.title)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        colors={[colors.secondary, colors.secondaryDark]}
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
            <Text style={styles.title}>All Challenges</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate("AdminCreateChallenge")}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.textWhite} />
              <Text style={styles.createButtonText}>Create New</Text>
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
            <Text style={styles.emptyText}>No challenges yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("AdminCreateChallenge")}
            >
              <Text style={styles.emptyButtonText}>Create First Challenge</Text>
            </TouchableOpacity>
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  createButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  challengeCard: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  challengeMeta: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: colors.success + "20",
  },
  statusBadgeInactive: {
    backgroundColor: colors.textLight + "20",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.textLight,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary + "15",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error + "15",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.error,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 16,
  },
});

export default AdminChallengesScreen;





