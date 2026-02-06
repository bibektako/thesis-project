import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelTrek } from "../services/trekSessions";
import { cacheTilesForRoute } from "../utils/offlineMapCache";
import CancelTrekModal from "../components/CancelTrekModal";
import { colors } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const TrekMapScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge, trekSession, submissions = [] } = route.params;
    const mapRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [cachingProgress, setCachingProgress] = useState(null);
    const [locationSubscription, setLocationSubscription] = useState(null);

    const checkpoints = challenge?.checkpoints || [];
    const routePoints = challenge?.route_points || [];

    // Determine completed checkpoint IDs from submissions
    const completedCheckpointIds = submissions
        .filter((s) => s.status === "verified")
        .map((s) => s.checkpoint_id);

    // Build polyline coordinates from route_points or fallback to checkpoint coords
    const polylineCoords =
        routePoints.length > 0
            ? routePoints.map((rp) => ({
                latitude: rp.latitude,
                longitude: rp.longitude,
            }))
            : checkpoints
                .sort((a, b) => a.order_index - b.order_index)
                .map((cp) => ({
                    latitude: cp.latitude,
                    longitude: cp.longitude,
                }));

    useEffect(() => {
        initializeMap();
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });
        return () => {
            unsubscribe();
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    const initializeMap = async () => {
        try {
            // Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Required", "Location permission is needed for the map");
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            // Start watching location
            const sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (loc) => {
                    setUserLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                }
            );
            setLocationSubscription(sub);

            // Cache tiles for offline use
            cacheRouteForOffline();

            // Cache challenge data in AsyncStorage for offline access
            await AsyncStorage.setItem(
                `trek_challenge_${challenge.id}`,
                JSON.stringify(challenge)
            );
        } catch (error) {
            console.error("Map initialization error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const cacheRouteForOffline = async () => {
        const allPoints = [
            ...checkpoints.map((cp) => ({
                latitude: cp.latitude,
                longitude: cp.longitude,
            })),
            ...routePoints,
        ];

        if (allPoints.length === 0) return;

        setCachingProgress({ downloaded: 0, total: 0 });
        try {
            await cacheTilesForRoute(allPoints, [13, 14, 15, 16], (downloaded, total) => {
                setCachingProgress({ downloaded, total });
            });
        } catch (error) {
            console.warn("Tile caching error:", error.message);
        }
        setCachingProgress(null);
    };

    const handleCancelTrek = async () => {
        if (!trekSession?.id) return;

        setIsCancelling(true);
        try {
            await cancelTrek(trekSession.id, "User cancelled during trek");
            setShowCancelModal(false);
            Alert.alert(
                "Trek Cancelled",
                "Your progress has been saved. You can restart this challenge anytime!",
                [{ text: "OK", onPress: () => navigation.navigate("MainTabs") }]
            );
        } catch (error) {
            Alert.alert("Error", error.response?.data?.detail || "Failed to cancel trek");
        } finally {
            setIsCancelling(false);
        }
    };

    const getCheckpointStatus = (checkpoint) => {
        if (completedCheckpointIds.includes(checkpoint.checkpoint_id)) {
            return "completed";
        }
        // First non-completed checkpoint in order is "current"
        const sortedCheckpoints = [...checkpoints].sort(
            (a, b) => a.order_index - b.order_index
        );
        for (const cp of sortedCheckpoints) {
            if (!completedCheckpointIds.includes(cp.checkpoint_id)) {
                return cp.checkpoint_id === checkpoint.checkpoint_id
                    ? "current"
                    : "upcoming";
            }
        }
        return "upcoming";
    };

    const getMarkerColor = (status) => {
        switch (status) {
            case "completed":
                return colors.success;
            case "current":
                return colors.accent;
            default:
                return colors.textLight;
        }
    };

    const fitMapToRoute = () => {
        if (mapRef.current && polylineCoords.length > 0) {
            mapRef.current.fitToCoordinates(polylineCoords, {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
            });
        }
    };

    const centerOnUser = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                },
                1000
            );
        }
    };

    const navigateToCapture = () => {
        navigation.navigate("CaptureCheckpoint", {
            challengeId: challenge.id,
            challenge: challenge,
            trekSession: trekSession,
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    // Calculate initial region from checkpoints
    const allLats = checkpoints.map((cp) => cp.latitude);
    const allLngs = checkpoints.map((cp) => cp.longitude);
    const centerLat = allLats.reduce((a, b) => a + b, 0) / allLats.length || 27.7;
    const centerLng = allLngs.reduce((a, b) => a + b, 0) / allLngs.length || 85.3;
    const latDelta =
        allLats.length > 1
            ? (Math.max(...allLats) - Math.min(...allLats)) * 1.5 + 0.01
            : 0.02;
    const lngDelta =
        allLngs.length > 1
            ? (Math.max(...allLngs) - Math.min(...allLngs)) * 1.5 + 0.01
            : 0.02;

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={{
                    latitude: centerLat,
                    longitude: centerLng,
                    latitudeDelta: latDelta,
                    longitudeDelta: lngDelta,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                mapType="standard"
            >
                {/* Route Polyline */}
                {polylineCoords.length > 1 && (
                    <Polyline
                        coordinates={polylineCoords}
                        strokeColor={colors.primary}
                        strokeWidth={4}
                        lineDashPattern={[0]}
                    />
                )}

                {/* Checkpoint Markers */}
                {checkpoints
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((checkpoint, index) => {
                        const status = getCheckpointStatus(checkpoint);
                        const markerColor = getMarkerColor(status);

                        return (
                            <Marker
                                key={checkpoint.checkpoint_id}
                                coordinate={{
                                    latitude: checkpoint.latitude,
                                    longitude: checkpoint.longitude,
                                }}
                                title={`${index + 1}. ${checkpoint.title}`}
                                description={
                                    status === "completed"
                                        ? "✅ Completed"
                                        : status === "current"
                                            ? "📍 Current checkpoint"
                                            : "⬜ Upcoming"
                                }
                                pinColor={markerColor}
                            />
                        );
                    })}
            </MapView>

            {/* Top Header Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.topBarButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.topBarCenter}>
                    <Text style={styles.topBarTitle} numberOfLines={1}>
                        {challenge.title}
                    </Text>
                    <Text style={styles.topBarSubtitle}>
                        {completedCheckpointIds.length}/{checkpoints.length} checkpoints
                    </Text>
                </View>

                {isOffline && (
                    <View style={styles.offlineBadge}>
                        <Ionicons name="cloud-offline-outline" size={14} color={colors.textWhite} />
                        <Text style={styles.offlineText}>Offline</Text>
                    </View>
                )}
            </View>

            {/* Caching Progress */}
            {cachingProgress && (
                <View style={styles.cachingBar}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.cachingText}>
                        Caching map tiles: {cachingProgress.downloaded}/{cachingProgress.total}
                    </Text>
                </View>
            )}

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                {/* Map Control Buttons */}
                <View style={styles.mapButtons}>
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={fitMapToRoute}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="map-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={centerOnUser}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="locate-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Action Card */}
                <View style={styles.actionCard}>
                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                            <LinearGradient
                                colors={[colors.secondary, colors.secondaryDark]}
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${checkpoints.length > 0
                                                ? (completedCheckpointIds.length / checkpoints.length) * 100
                                                : 0
                                            }%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressLabel}>
                            {completedCheckpointIds.length} of {checkpoints.length} completed
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={navigateToCapture}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.secondary, colors.secondaryDark]}
                                style={styles.captureButtonGradient}
                            >
                                <Ionicons name="camera-outline" size={20} color={colors.textWhite} />
                                <Text style={styles.captureButtonText}>Capture Checkpoint</Text>
                            </LinearGradient>
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
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.legendLabel}>Done</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                    <Text style={styles.legendLabel}>Current</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.textLight }]} />
                    <Text style={styles.legendLabel}>Upcoming</Text>
                </View>
            </View>

            {/* Cancel Trek Modal */}
            <CancelTrekModal
                visible={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirmCancel={handleCancelTrek}
                checkpointsCompleted={completedCheckpointIds.length}
                totalCheckpoints={checkpoints.length}
                challengeTitle={challenge.title}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    map: {
        width: width,
        height: height,
        position: "absolute",
        top: 0,
        left: 0,
    },

    // Top Bar
    topBar: {
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.backgroundLight + "F0",
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    topBarButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    topBarCenter: {
        flex: 1,
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    topBarSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "500",
        marginTop: 2,
    },
    offlineBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.warning,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    offlineText: {
        color: colors.textWhite,
        fontSize: 11,
        fontWeight: "700",
    },

    // Caching bar
    cachingBar: {
        position: "absolute",
        top: 120,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.backgroundLight + "E0",
        borderRadius: 12,
        padding: 10,
        gap: 8,
    },
    cachingText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "500",
    },

    // Bottom Controls
    bottomControls: {
        position: "absolute",
        bottom: 30,
        left: 16,
        right: 16,
    },
    mapButtons: {
        alignSelf: "flex-end",
        gap: 8,
        marginBottom: 12,
    },
    mapButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.backgroundLight,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionCard: {
        backgroundColor: colors.backgroundLight,
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    progressSection: {
        marginBottom: 14,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "600",
        textAlign: "center",
    },
    actionButtons: {
        gap: 10,
    },
    captureButton: {
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    captureButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        gap: 8,
    },
    captureButtonText: {
        color: colors.textWhite,
        fontSize: 16,
        fontWeight: "700",
    },
    cancelTrekButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.error + "30",
        gap: 6,
    },
    cancelTrekButtonText: {
        color: colors.error,
        fontSize: 14,
        fontWeight: "600",
    },

    // Legend
    legend: {
        position: "absolute",
        top: 120,
        right: 16,
        flexDirection: "column",
        backgroundColor: colors.backgroundLight + "E0",
        borderRadius: 12,
        padding: 10,
        gap: 6,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: "600",
    },
});

export default TrekMapScreen;
