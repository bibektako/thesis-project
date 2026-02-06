import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  
  // Card styles
  card: {
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
  cardElevated: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Text styles
  heading1: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  
  // Badge styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgePrimary: {
    backgroundColor: colors.primary + "15",
  },
  badgeSuccess: {
    backgroundColor: colors.success + "15",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});





