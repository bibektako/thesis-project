import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

const CameraView = ({ onCapture, onClose, mode = "photo" }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const requestPermissions = async () => {
    if (mode === "selfie" || mode === "photo") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture photos."
        );
        return false;
      }
    }
    return true;
  };

  const capturePhoto = async () => {
    if (isCapturing) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      onClose();
      return;
    }

    setIsCapturing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        cameraType:
          mode === "selfie"
            ? ImagePicker.CameraType.front
            : ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onCapture({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
      console.error("Capture error:", error);
    } finally {
      setIsCapturing(false);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color={colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {mode === "selfie" ? "Take Selfie" : "Take Photo"}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons
              name={mode === "selfie" ? "person-circle-outline" : "camera-outline"}
              size={72}
              color={colors.textWhite}
              style={styles.iconEmoji}
            />
          </View>

          <Text style={styles.instruction}>
            Tap the button below to open your camera
          </Text>

          <TouchableOpacity
            style={[
              styles.captureButton,
              isCapturing && styles.captureButtonDisabled,
            ]}
            onPress={capturePhoto}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent, "#F97316"]}
              style={styles.captureButtonGradient}
            >
              {isCapturing ? (
                <Text style={styles.captureButtonText}>Opening Camera...</Text>
              ) : (
                <Text style={styles.captureButtonText}>
                  {mode === "selfie" ? "Take Selfie" : "Take Photo"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.textWhite,
    fontSize: 24,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textWhite,
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconEmoji: {
    fontSize: 80,
  },
  instruction: {
    fontSize: 18,
    color: colors.textWhite + "DD",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "500",
    lineHeight: 26,
  },
  captureButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonGradient: {
    padding: 20,
    alignItems: "center",
  },
  captureButtonText: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default CameraView;
