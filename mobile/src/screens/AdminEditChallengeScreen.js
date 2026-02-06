import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getChallenge } from "../services/challenges";
import { updateChallenge } from "../services/admin";
import { colors } from "../theme/colors";

const AdminEditChallengeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { challengeId } = route.params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsPerCheckpoint, setPointsPerCheckpoint] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [checkpoints, setCheckpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      const data = await getChallenge(challengeId);
      setTitle(data.title);
      setDescription(data.description);
      setPointsPerCheckpoint(String(data.points_per_checkpoint || 10));
      setIsActive(data.is_active !== false);
      setCheckpoints(data.checkpoints || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load challenge");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const updateCheckpoint = (index, field, value) => {
    const newCheckpoints = [...checkpoints];
    if (field === "require_selfie" || field === "require_photo" || field === "gps_required") {
      newCheckpoints[index][field] = value;
    } else if (field === "latitude" || field === "longitude" || field === "gps_radius") {
      newCheckpoints[index][field] = value;
    } else {
      newCheckpoints[index][field] = value;
    }
    setCheckpoints(newCheckpoints);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Please fill in title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const challengeData = {
        title,
        description,
        points_per_checkpoint: parseInt(pointsPerCheckpoint) || 10,
        is_active: isActive,
        checkpoints: checkpoints.map((cp) => ({
          checkpoint_id: cp.checkpoint_id,
          title: cp.title,
          description: cp.description,
          latitude: typeof cp.latitude === "string" ? parseFloat(cp.latitude) : cp.latitude,
          longitude: typeof cp.longitude === "string" ? parseFloat(cp.longitude) : cp.longitude,
          expected_sign_text: cp.expected_sign_text,
          require_selfie: cp.require_selfie,
          require_photo: cp.require_photo,
          order_index: cp.order_index,
          gps_required: cp.gps_required,
          gps_radius: typeof cp.gps_radius === "string" ? parseFloat(cp.gps_radius) : cp.gps_radius,
        })),
      };

      await updateChallenge(challengeId, challengeData);
      Alert.alert("Success", "Challenge updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || "Failed to update challenge");
    } finally {
      setIsSubmitting(false);
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
        colors={[colors.primary, colors.primaryDark]}
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
          <Text style={styles.title}>Edit Challenge</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter challenge title"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter challenge description"
              placeholderTextColor={colors.textLight}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Points per Checkpoint</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor={colors.textLight}
                value={pointsPerCheckpoint}
                onChangeText={setPointsPerCheckpoint}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: colors.border, true: colors.success }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checkpoints ({checkpoints.length})</Text>

          {checkpoints.map((checkpoint, index) => (
            <View key={checkpoint.checkpoint_id} style={styles.checkpointCard}>
              <View style={styles.checkpointHeader}>
                <Text style={styles.checkpointNumber}>#{index + 1}</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Checkpoint title"
                  placeholderTextColor={colors.textLight}
                  value={checkpoint.title}
                  onChangeText={(text) => updateCheckpoint(index, "title", text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Checkpoint description"
                  placeholderTextColor={colors.textLight}
                  value={checkpoint.description}
                  onChangeText={(text) => updateCheckpoint(index, "description", text)}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Latitude *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="37.7749"
                    placeholderTextColor={colors.textLight}
                    value={String(checkpoint.latitude || "")}
                    onChangeText={(text) => updateCheckpoint(index, "latitude", text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Longitude *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-122.4194"
                    placeholderTextColor={colors.textLight}
                    value={String(checkpoint.longitude || "")}
                    onChangeText={(text) => updateCheckpoint(index, "longitude", text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Expected Sign Text *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Text that should appear in photo"
                  placeholderTextColor={colors.textLight}
                  value={checkpoint.expected_sign_text}
                  onChangeText={(text) => updateCheckpoint(index, "expected_sign_text", text)}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>GPS Radius (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor={colors.textLight}
                    value={String(checkpoint.gps_radius || "50")}
                    onChangeText={(text) => updateCheckpoint(index, "gps_radius", text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Require Photo</Text>
                  <Switch
                    value={checkpoint.require_photo !== false}
                    onValueChange={(value) => updateCheckpoint(index, "require_photo", value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Require Selfie</Text>
                  <Switch
                    value={checkpoint.require_selfie || false}
                    onValueChange={(value) => updateCheckpoint(index, "require_selfie", value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>GPS Required</Text>
                  <Switch
                    value={checkpoint.gps_required !== false}
                    onValueChange={(value) => updateCheckpoint(index, "gps_required", value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

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
              colors={[colors.primary, colors.primaryDark]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>💾 Save Changes</Text>
            </LinearGradient>
          )}
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
  },
  switchContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  checkpointCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkpointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checkpointNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 40,
    shadowColor: colors.primary,
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
});

export default AdminEditChallengeScreen;





