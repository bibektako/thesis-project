import api from "./api";

export const startTrek = async (challengeId) => {
    const response = await api.post("/api/trek-sessions/start", {
        challenge_id: challengeId,
    });
    return response.data;
};

export const cancelTrek = async (sessionId, reason = null) => {
    const response = await api.put(`/api/trek-sessions/${sessionId}/cancel`, {
        reason: reason || "User cancelled",
    });
    return response.data;
};

export const getActiveTrek = async (challengeId = null) => {
    const params = challengeId ? `?challenge_id=${challengeId}` : "";
    const response = await api.get(`/api/trek-sessions/active${params}`);
    return response.data;
};

export const getTrekHistory = async () => {
    const response = await api.get("/api/trek-sessions/history");
    return response.data;
};
