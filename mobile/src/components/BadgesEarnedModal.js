import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

const BadgesEarnedModal = ({
  visible,
  onClose,
  earnedBadges = [],
  completedCheckpoints = 0,
  totalCheckpoints = 0,
  challengeTitle = "",
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            style={styles.header}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark" size={44} color="#fff" />
            </View>
            <Text style={styles.title}>Safe Exit</Text>
            <Text style={styles.subtitle}>
              You earned {earnedBadges.length} badge{earnedBadges.length !== 1 ? "s" : ""} for
              completing {completedCheckpoints} of {totalCheckpoints} checkpoints.
            </Text>
            {challengeTitle ? (
              <Text style={styles.challengeName} numberOfLines={1}>
                {challengeTitle}
              </Text>
            ) : null}
          </LinearGradient>

          <ScrollView
            style={styles.badgeList}
            contentContainerStyle={styles.badgeListContent}
            showsVerticalScrollIndicator={false}
          >
            {earnedBadges.map((b, i) => (
              <View key={i} style={styles.badgeRow}>
                <LinearGradient
                  colors={b.gradient || [colors.primary, colors.primaryDark]}
                  style={styles.badgeIconBox}
                >
                  <Ionicons
                    name={b.icon || "ribbon"}
                    size={28}
                    color="#fff"
                  />
                </LinearGradient>
                <View style={styles.badgeText}>
                  <Text style={styles.badgeName}>{b.name}</Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {b.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.closeBtnGradient}
            >
              <Text style={styles.closeBtnText}>View Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.backgroundLight,
    borderRadius: 24,
    overflow: "hidden",
    maxHeight: "85%",
  },
  header: {
    padding: 28,
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 4,
  },
  challengeName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  badgeList: {
    maxHeight: 220,
  },
  badgeListContent: {
    padding: 20,
    paddingTop: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  badgeText: { flex: 1 },
  badgeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  closeBtn: {
    margin: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  closeBtnGradient: {
    padding: 18,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default BadgesEarnedModal;
