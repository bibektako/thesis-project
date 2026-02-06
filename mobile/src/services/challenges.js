import api from "./api";

export const getChallenges = async () => {
  const response = await api.get("/api/challenges");
  return response.data;
};

export const getChallenge = async (challengeId) => {
  const response = await api.get(`/api/challenges/${challengeId}`);
  return response.data;
};

export const createChallenge = async (challengeData) => {
  const response = await api.post("/api/admin/challenges", challengeData);
  return response.data;
};

export const updateChallenge = async (challengeId, challengeData) => {
  const response = await api.put(
    `/api/admin/challenges/${challengeId}`,
    challengeData
  );
  return response.data;
};

export const deleteChallenge = async (challengeId) => {
  const response = await api.delete(`/api/admin/challenges/${challengeId}`);
  return response.data;
};




