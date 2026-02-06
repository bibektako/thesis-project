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
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getChallenge } from "../services/challenges";
import { colors } from "../theme/colors";

const ChallengeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      const data = await getChallenge(challengeId);
      setChallenge(data);
    } catch (error) {
      console.error("Error loading challenge:", error);
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

  if (!challenge) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Challenge not found</Text>
      </View>
    );
  }

  const totalPoints =
    (challenge.points_per_checkpoint || 10) *
    (challenge.checkpoints?.length || 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
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
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {challenge.checkpoints?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Checkpoints</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Checkpoints</Text>
        {challenge.checkpoints?.map((checkpoint, index) => (
          <View key={checkpoint.checkpoint_id} style={styles.checkpointCard}>
            <View style={styles.checkpointHeader}>
              <LinearGradient
                colors={[colors.accent, "#F97316"]}
                style={styles.checkpointNumberBadge}
              >
                <Text style={styles.checkpointNumber}>{index + 1}</Text>
              </LinearGradient>
              <View style={styles.checkpointTitleContainer}>
                <Text style={styles.checkpointTitle}>{checkpoint.title}</Text>
                <Text style={styles.checkpointOrder}>
                  Checkpoint {index + 1} of {challenge.checkpoints.length}
                </Text>
              </View>
            </View>
            <Text style={styles.checkpointDescription}>
              {checkpoint.description}
            </Text>
            <View style={styles.requirementsContainer}>
              {checkpoint.require_photo && (
                <View style={styles.requirementBadge}>
                  <Ionicons name="camera-outline" size={16} color={colors.primary} style={styles.requirementEmoji} />
                  <Text style={styles.requirementText}>Photo</Text>
                </View>
              )}
              {checkpoint.require_selfie && (
                <View style={styles.requirementBadge}>
                  <Ionicons name="person-circle-outline" size={16} color={colors.primary} style={styles.requirementEmoji} />
                  <Text style={styles.requirementText}>Selfie</Text>
                </View>
              )}
              {checkpoint.gps_required && (
                <View style={styles.requirementBadge}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} style={styles.requirementEmoji} />
                  <Text style={styles.requirementText}>GPS</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate("CaptureCheckpoint", {
              challengeId: challenge.id,
              challenge: challenge,
            })
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            style={styles.startButtonGradient}
          >
              <Text style={styles.startButtonText}>Start Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "600",
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
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: colors.textWhite + "DD",
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.backgroundLight + "20",
    borderRadius: 16,
    padding: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.textWhite + "30",
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textWhite + "CC",
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
  checkpointCard: {
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
  checkpointHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkpointNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  checkpointNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textWhite,
  },
  checkpointTitleContainer: {
    flex: 1,
  },
  checkpointTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  checkpointOrder: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  checkpointDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  requirementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  requirementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  requirementEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonGradient: {
    padding: 20,
    alignItems: "center",
  },
  startButtonText: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default ChallengeDetailScreen;
