import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/api/admin/stats");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/api/admin/users");
  return response.data;
};

export const getAllSubmissions = async (status = null, challengeId = null) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (challengeId) params.append("challenge_id", challengeId);
  
  const queryString = params.toString();
  const url = `/api/admin/submissions${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

export const approveSubmission = async (submissionId) => {
  const response = await api.put(`/api/admin/submissions/${submissionId}/approve`);
  return response.data;
};

export const rejectSubmission = async (submissionId, reason = null) => {
  const response = await api.put(`/api/admin/submissions/${submissionId}/reject`, {
    reason: reason || "Rejected by admin",
  });
  return response.data;
};

export const getAllChallengesAdmin = async () => {
  const response = await api.get("/api/admin/challenges");
  return response.data;
};

export const createChallenge = async (challengeData) => {
  const response = await api.post("/api/admin/challenges", challengeData);
  return response.data;
};

export const updateChallenge = async (challengeId, challengeData) => {
  const response = await api.put(`/api/admin/challenges/${challengeId}`, challengeData);
  return response.data;
};

export const deleteChallenge = async (challengeId) => {
  const response = await api.delete(`/api/admin/challenges/${challengeId}`);
  return response.data;
};

