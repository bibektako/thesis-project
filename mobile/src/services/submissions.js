import api from "./api";

export const submitCheckpoint = async (submissionData) => {
  const formData = new FormData();

  formData.append("challenge_id", submissionData.challengeId);
  formData.append("checkpoint_id", submissionData.checkpointId);
  formData.append("gps_latitude", submissionData.gpsLatitude.toString());
  formData.append("gps_longitude", submissionData.gpsLongitude.toString());

  if (submissionData.photo) {
    formData.append("photo", {
      uri: submissionData.photo.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
  }

  if (submissionData.selfie) {
    formData.append("selfie", {
      uri: submissionData.selfie.uri,
      type: "image/jpeg",
      name: "selfie.jpg",
    });
  }

  const response = await api.post("/api/submissions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getSubmission = async (submissionId) => {
  const response = await api.get(`/api/submissions/${submissionId}`);
  return response.data;
};




