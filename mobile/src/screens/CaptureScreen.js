import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CameraView from "../components/CameraView";
import CancelTrekModal from "../components/CancelTrekModal";
import BadgesEarnedModal from "../components/BadgesEarnedModal";
import { getCurrentLocation, requestLocationPermission } from "../utils/gps";
import { submitCheckpoint } from "../services/submissions";
import { safeExitChallenge } from "../services/challenges";
import api from "../services/api";
import { awardBadge } from "../services/auth";
import useAuthStore from "../state/useAuthStore";
import { colors } from "../theme/colors";

const RAPID_ALTITUDE_GAIN_METERS = 200;
const RAPID_ALTITUDE_TIME_MS = 15 * 60 * 1000;

const CaptureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challengeId, challenge, trekSession } = route.params;
  const { user, refreshUser } = useAuthStore();

  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState("photo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [earnedBadgesResult, setEarnedBadgesResult] = useState(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState(0);
  const [lastAltitudeState, setLastAltitudeState] = useState({ altitude: null, time: null });

  const currentCheckpoint = challenge?.checkpoints?.[currentCheckpointIndex];
  const progress = ((currentCheckpointIndex + 1) / (challenge?.checkpoints?.length || 1)) * 100;

  useEffect(() => {
    initializePermissions();
  }, []);

  useEffect(() => {
    if (!challengeId) return;
    const loadCompleted = async () => {
      try {
        const res = await api.get(`/api/submissions?challenge_id=${challengeId}`);
        const list = res.data || [];
        const verified = list.filter((s) => s.status === "verified" || s.status === "pending_admin");
        setCompletedCheckpoints(verified.length);
      } catch (e) {
        console.warn("Load submissions for count failed:", e?.message);
      }
    };
    loadCompleted();
  }, [challengeId]);

  const initializePermissions = async () => {
    const locationPermission = await requestLocationPermission();
    setHasLocationPermission(locationPermission);

    if (!locationPermission) {
      Alert.alert("Permission Required", "Location permission is required");
    }
  };

  const captureLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      const now = Date.now();
      const prev = lastAltitudeState;
      if (
        loc.altitude != null &&
        prev.altitude != null &&
        prev.time != null &&
        now - prev.time < RAPID_ALTITUDE_TIME_MS &&
        (loc.altitude - prev.altitude) >= RAPID_ALTITUDE_GAIN_METERS
      ) {
        Alert.alert(
          "Altitude warning",
          "You have ascended quickly. Take it easy, stay hydrated, and watch for signs of altitude sickness. Consider resting before continuing.",
          [
            {
              text: "OK",
              onPress: () => {
                awardBadge("altitude_aware").then(() => refreshUser()).catch(() => {});
              },
            },
          ]
        );
      }
      setLastAltitudeState({ altitude: loc.altitude ?? prev.altitude, time: now });
      setLocation(loc);
      Alert.alert(
        "Location Captured",
        `Lat: ${loc.latitude.toFixed(6)}\nLng: ${loc.longitude.toFixed(6)}${loc.altitude != null ? `\nAlt: ${Math.round(loc.altitude)} m` : ""}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error("Location error:", error);
    }
  };

  const handlePhotoCapture = (capturedPhoto) => {
    setPhoto(capturedPhoto);
    setShowCamera(false);

    if (currentCheckpoint?.require_selfie) {
      Alert.alert("Photo Captured", "Now capture your selfie");
    }
  };

  const handleSelfieCapture = (capturedSelfie) => {
    setSelfie(capturedSelfie);
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert("Error", "Please capture a photo");
      return;
    }

    if (currentCheckpoint?.require_selfie && !selfie) {
      Alert.alert("Error", "Selfie is required for this checkpoint");
      return;
    }

    if (currentCheckpoint?.gps_required && !location) {
      Alert.alert("Error", "Please capture your location");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        challengeId,
        checkpointId: currentCheckpoint.checkpoint_id,
        gpsLatitude: location?.latitude || 0,
        gpsLongitude: location?.longitude || 0,
        photo,
        selfie: currentCheckpoint.require_selfie ? selfie : null,
      };

      const result = await submitCheckpoint(submissionData);

      Alert.alert(
        "Submission Successful",
        `Status: ${result.status}\n${result.status === "verified"
          ? "Points awarded! 🎉"
          : "Pending verification"
        }`,
        [
          {
            text: "OK",
              onPress: () => {
              setPhoto(null);
              setSelfie(null);
              setLocation(null);
              setCompletedCheckpoints((c) => c + 1);

              if (
                currentCheckpointIndex <
                challenge.checkpoints.length - 1
              ) {
                setCurrentCheckpointIndex(currentCheckpointIndex + 1);
              } else {
                Alert.alert(
                  "Congratulations! 🎊",
                  "You completed all checkpoints!"
                );
                navigation.navigate("MainTabs");
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMap = () => {
    navigation.navigate("TrekMap", {
      challenge: challenge,
      trekSession: trekSession,
      submissions: [],
    });
  };

  const handleCancelTrek = async () => {
    setShowCancelModal(false);
    try {
      const result = await safeExitChallenge(challengeId);
      setEarnedBadgesResult(result);
      setShowBadgesModal(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Safe exit failed. You can still leave the screen."
      );
      navigation.navigate("MainTabs");
    }
  };

  const handleCloseBadgesModal = () => {
    setShowBadgesModal(false);
    setEarnedBadgesResult(null);
    refreshUser();
    navigation.navigate("MainTabs");
  };

  if (showCamera) {
    return (
      <CameraView
        onCapture={
          cameraMode === "photo" ? handlePhotoCapture : handleSelfieCapture
        }
        onClose={() => setShowCamera(false)}
        mode={cameraMode}
      />
    );
  }

  if (!currentCheckpoint) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No checkpoint available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.accent, "#F97316"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textWhite} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={handleViewMap}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={20} color={colors.textWhite} />
              <Text style={styles.mapIconText}>Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentCheckpointIndex + 1} of {challenge.checkpoints.length}
            </Text>
          </View>
          <Text style={styles.checkpointTitle}>{currentCheckpoint.title}</Text>
          <Text style={styles.checkpointDescription}>
            {currentCheckpoint.description}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Requirements</Text>

        <TouchableOpacity
          style={[
            styles.captureCard,
            photo && styles.captureCardDone,
          ]}
          onPress={() => {
            setCameraMode("photo");
            setShowCamera(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.captureCardContent}>
            <View style={[styles.iconContainer, photo && styles.iconContainerDone]}>
              <Ionicons
                name={photo ? "checkmark-circle" : "camera-outline"}
                size={24}
                color={photo ? colors.success : colors.primary}
              />
            </View>
            <View style={styles.captureCardText}>
              <Text style={styles.captureCardTitle}>
                {photo ? "Photo Captured" : "Capture Photo"}
              </Text>
              <Text style={styles.captureCardSubtitle}>
                {photo
                  ? "Tap to retake"
                  : "Take a photo of the checkpoint sign"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {currentCheckpoint.require_selfie && (
          <TouchableOpacity
            style={[
              styles.captureCard,
              selfie && styles.captureCardDone,
            ]}
            onPress={() => {
              setCameraMode("selfie");
              setShowCamera(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.captureCardContent}>
              <View style={[styles.iconContainer, selfie && styles.iconContainerDone]}>
                <Ionicons
                  name={selfie ? "checkmark-circle" : "person-circle-outline"}
                  size={24}
                  color={selfie ? colors.success : colors.primary}
                />
              </View>
              <View style={styles.captureCardText}>
                <Text style={styles.captureCardTitle}>
                  {selfie ? "Selfie Captured" : "Capture Selfie"}
                </Text>
                <Text style={styles.captureCardSubtitle}>
                  {selfie ? "Tap to retake" : "Take a selfie for verification"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {currentCheckpoint.gps_required && (
          <TouchableOpacity
            style={[
              styles.captureCard,
              location && styles.captureCardDone,
            ]}
            onPress={captureLocation}
            activeOpacity={0.8}
          >
            <View style={styles.captureCardContent}>
              <View style={[styles.iconContainer, location && styles.iconContainerDone]}>
                <Ionicons
                  name={location ? "checkmark-circle" : "location-outline"}
                  size={24}
                  color={location ? colors.success : colors.primary}
                />
              </View>
              <View style={styles.captureCardText}>
                <Text style={styles.captureCardTitle}>
                  {location ? "Location Captured" : "Capture Location"}
                </Text>
                <Text style={styles.captureCardSubtitle}>
                  {location
                    ? "Tap to recapture"
                    : "Get your current GPS location"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>
              <Ionicons name="location-outline" size={16} color={colors.textPrimary} /> Location Details
            </Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Latitude:</Text>
              <Text style={styles.locationValue}>
                {location.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Longitude:</Text>
              <Text style={styles.locationValue}>
                {location.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Accuracy:</Text>
              <Text style={styles.locationValue}>
                {location.accuracy?.toFixed(0)}m
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                ✓ Submit Checkpoint
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelTrekButton}
          onPress={() => setShowCancelModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={18} color={colors.error} />
          <Text style={styles.cancelTrekButtonText}>Cancel Trek</Text>
        </TouchableOpacity>
      </View>

      <CancelTrekModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleCancelTrek}
        checkpointsCompleted={completedCheckpoints}
        totalCheckpoints={challenge?.checkpoints?.length || 0}
        challengeTitle={challenge?.title || ""}
      />

      <BadgesEarnedModal
        visible={showBadgesModal}
        onClose={handleCloseBadgesModal}
        earnedBadges={earnedBadgesResult?.earned_badges || []}
        completedCheckpoints={earnedBadgesResult?.completed_checkpoints ?? 0}
        totalCheckpoints={earnedBadgesResult?.total_checkpoints ?? 0}
        challengeTitle={earnedBadgesResult?.challenge_title ?? ""}
      />
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
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight + "30",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.textWhite,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textWhite + "CC",
    fontWeight: "600",
    textAlign: "center",
  },
  checkpointTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textWhite,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  checkpointDescription: {
    fontSize: 16,
    color: colors.textWhite + "DD",
    lineHeight: 24,
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
  captureCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  captureCardDone: {
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  captureCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconContainerDone: {
    backgroundColor: colors.success + "20",
  },
  iconEmoji: {
    fontSize: 28,
  },
  captureCardText: {
    flex: 1,
  },
  captureCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  captureCardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: colors.info + "10",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.info + "30",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  locationValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    padding: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mapIconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mapIconText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelTrekButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.error + "30",
    gap: 6,
    marginTop: 12,
  },
  cancelTrekButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CaptureScreen;
