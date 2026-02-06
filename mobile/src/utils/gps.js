import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Location permission error:", error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error("Location permission not granted");
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude ?? null,
    };
  } catch (error) {
    console.error("Location error:", error);
    throw error;
  }
};
