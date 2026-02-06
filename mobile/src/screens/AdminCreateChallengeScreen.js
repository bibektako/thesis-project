import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createChallenge } from "../services/admin";
import { colors } from "../theme/colors";

const AdminCreateChallengeScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsPerCheckpoint, setPointsPerCheckpoint] = useState("10");
  const [checkpoints, setCheckpoints] = useState([
    {
      checkpoint_id: `cp-${Date.now()}-1`,
      title: "",
      description: "",
      latitude: "",
      longitude: "",
      expected_sign_text: "",
      require_selfie: false,
      require_photo: true,
      order_index: 1,
      gps_required: true,
      gps_radius: "50",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCheckpoint = () => {
    setCheckpoints([
      ...checkpoints,
      {
        checkpoint_id: `cp-${Date.now()}-${checkpoints.length + 1}`,
        title: "",
        description: "",
        latitude: "",
        longitude: "",
        expected_sign_text: "",
        require_selfie: false,
        require_photo: true,
        order_index: checkpoints.length + 1,
        gps_required: true,
        gps_radius: "50",
      },
    ]);
  };

  const removeCheckpoint = (index) => {
    if (checkpoints.length > 1) {
      const newCheckpoints = checkpoints.filter((_, i) => i !== index);
      // Reorder indices
      newCheckpoints.forEach((cp, i) => {
        cp.order_index = i + 1;
      });
      setCheckpoints(newCheckpoints);
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

  const validateAndSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Please fill in title and description");
      return;
    }

    if (checkpoints.length === 0) {
      Alert.alert("Error", "Please add at least one checkpoint");
      return;
    }

    // Validate checkpoints
    for (let i = 0; i < checkpoints.length; i++) {
      const cp = checkpoints[i];
      if (!cp.title || !cp.description) {
        Alert.alert("Error", `Checkpoint ${i + 1}: Please fill in title and description`);
        return;
      }
      if (cp.gps_required && (!cp.latitude || !cp.longitude)) {
        Alert.alert("Error", `Checkpoint ${i + 1}: GPS coordinates required`);
        return;
      }
      if (cp.require_photo && !cp.expected_sign_text) {
        Alert.alert("Error", `Checkpoint ${i + 1}: Expected sign text required for photo verification`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const challengeData = {
        title,
        description,
        points_per_checkpoint: parseInt(pointsPerCheckpoint) || 10,
        checkpoints: checkpoints.map((cp) => {
          const lat = parseFloat(cp.latitude);
          const lng = parseFloat(cp.longitude);
          const radius = parseFloat(cp.gps_radius);
          
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error(`Checkpoint ${cp.order_index}: Invalid GPS coordinates`);
          }
          
          return {
            checkpoint_id: cp.checkpoint_id,
            title: cp.title,
            description: cp.description,
            latitude: lat,
            longitude: lng,
            expected_sign_text: cp.expected_sign_text,
            require_selfie: cp.require_selfie || false,
            require_photo: cp.require_photo !== false,
            order_index: cp.order_index,
            gps_required: cp.gps_required !== false,
            gps_radius: isNaN(radius) ? 50.0 : radius,
          };
        }),
      };

      await createChallenge(challengeData);
      Alert.alert("Success", "Challenge created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Create challenge error:", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.message || 
                          "Failed to create challenge";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.title}>Create Challenge</Text>
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

          <View style={styles.inputContainer}>
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checkpoints</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCheckpoint}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.textWhite} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {checkpoints.map((checkpoint, index) => (
            <View key={checkpoint.checkpoint_id} style={styles.checkpointCard}>
              <View style={styles.checkpointHeader}>
                <Text style={styles.checkpointNumber}>#{index + 1}</Text>
                {checkpoints.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCheckpoint(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
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
                    value={checkpoint.latitude}
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
                    value={checkpoint.longitude}
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
                    value={checkpoint.gps_radius}
                    onChangeText={(text) => updateCheckpoint(index, "gps_radius", text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Require Photo</Text>
                  <Switch
                    value={checkpoint.require_photo}
                    onValueChange={(value) => updateCheckpoint(index, "require_photo", value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Require Selfie</Text>
                  <Switch
                    value={checkpoint.require_selfie}
                    onValueChange={(value) => updateCheckpoint(index, "require_selfie", value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>GPS Required</Text>
                  <Switch
                    value={checkpoint.gps_required}
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
          onPress={validateAndSubmit}
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
              <Text style={styles.submitButtonText}>Create Challenge</Text>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 40,
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
});

export default AdminCreateChallengeScreen;

