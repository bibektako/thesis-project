import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

const MOTIVATIONAL_MESSAGES = [
    {
        emoji: "🏔️",
        title: "Every Step Counts!",
        message:
            "You've already made incredible progress. The mountains will always be here waiting for you to return stronger.",
    },
    {
        emoji: "💪",
        title: "Take Care of Yourself First!",
        message:
            "The bravest thing you can do is listen to your body. Rest up and come back even more determined.",
    },
    {
        emoji: "🌟",
        title: "You're Not Giving Up!",
        message:
            "You're making a smart choice. Champions know when to pause. Come back and conquer this trail!",
    },
    {
        emoji: "🌄",
        title: "The Journey Continues!",
        message:
            "This isn't the end — it's just a rest stop. Your adventure is far from over.",
    },
    {
        emoji: "🔥",
        title: "Your Spirit is Unbreakable!",
        message:
            "Completing even one checkpoint is an achievement. Be proud of how far you've come today.",
    },
    {
        emoji: "⛰️",
        title: "Respect the Mountain!",
        message:
            "Knowing your limits shows true wisdom. The trail will be here when you're ready for round two!",
    },
];

const CancelTrekModal = ({
    visible,
    onClose,
    onConfirmCancel,
    checkpointsCompleted = 0,
    totalCheckpoints = 0,
    challengeTitle = "",
}) => {
    const randomMessage =
        MOTIVATIONAL_MESSAGES[
        Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
        ];

    const progressPercent =
        totalCheckpoints > 0
            ? Math.round((checkpointsCompleted / totalCheckpoints) * 100)
            : 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Motivational Header */}
                    <LinearGradient
                        colors={[colors.accent, "#F97316"]}
                        style={styles.headerGradient}
                    >
                        <Text style={styles.emoji}>{randomMessage.emoji}</Text>
                        <Text style={styles.headerTitle}>{randomMessage.title}</Text>
                    </LinearGradient>

                    <View style={styles.content}>
                        {/* Motivational Message */}
                        <Text style={styles.motivationalMessage}>
                            {randomMessage.message}
                        </Text>

                        {/* Progress Summary */}
                        {totalCheckpoints > 0 && (
                            <View style={styles.progressCard}>
                                <Text style={styles.progressTitle}>Your Progress</Text>
                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBar}>
                                        <LinearGradient
                                            colors={[colors.secondary, colors.secondaryDark]}
                                            style={[
                                                styles.progressFill,
                                                { width: `${progressPercent}%` },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.progressPercent}>{progressPercent}%</Text>
                                </View>
                                <Text style={styles.progressDetail}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={14}
                                        color={colors.success}
                                    />{" "}
                                    {checkpointsCompleted} of {totalCheckpoints} checkpoints
                                    completed
                                </Text>
                            </View>
                        )}

                        {/* Challenge Name */}
                        {challengeTitle ? (
                            <Text style={styles.challengeName}>
                                <Ionicons
                                    name="trail-sign-outline"
                                    size={14}
                                    color={colors.textSecondary}
                                />{" "}
                                {challengeTitle}
                            </Text>
                        ) : null}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.keepGoingButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[colors.secondary, colors.secondaryDark]}
                                    style={styles.keepGoingGradient}
                                >
                                    <Ionicons
                                        name="flame-outline"
                                        size={20}
                                        color={colors.textWhite}
                                    />
                                    <Text style={styles.keepGoingText}>Keep Going!</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onConfirmCancel}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Yes, Cancel Trek</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: width - 40,
        backgroundColor: colors.backgroundLight,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headerGradient: {
        padding: 28,
        alignItems: "center",
    },
    emoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textWhite,
        textAlign: "center",
        letterSpacing: -0.3,
    },
    content: {
        padding: 24,
    },
    motivationalMessage: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 20,
    },
    progressCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 10,
    },
    progressBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 10,
        backgroundColor: colors.border,
        borderRadius: 5,
        overflow: "hidden",
        marginRight: 10,
    },
    progressFill: {
        height: "100%",
        borderRadius: 5,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
        width: 40,
        textAlign: "right",
    },
    progressDetail: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    challengeName: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        gap: 12,
    },
    keepGoingButton: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    keepGoingGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 8,
    },
    keepGoingText: {
        color: colors.textWhite,
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    cancelButton: {
        padding: 14,
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.error + "40",
        backgroundColor: colors.error + "08",
    },
    cancelButtonText: {
        color: colors.error,
        fontSize: 15,
        fontWeight: "600",
    },
});

export default CancelTrekModal;
