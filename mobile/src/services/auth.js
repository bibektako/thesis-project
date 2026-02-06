import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (username, email, password, faceConsent = false) => {
  try {
    console.log('[AUTH] Register request', {
      url: '/api/auth/register',
      baseURL: api.defaults.baseURL,
      username,
      email,
      faceConsent,
    });

    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      face_consent: faceConsent,
    });

    console.log('[AUTH] Register success', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.log('[AUTH] Register error', {
      message: error?.message,
      code: error?.code,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      status: error?.response?.status,
      detail: error?.response?.data,
    });
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    console.log('[AUTH] Login request', {
      url: '/api/auth/login',
      baseURL: api.defaults.baseURL,
      email,
    });
  
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }

    console.log('[AUTH] Login success', {
      status: response.status,
      data: {
        user: response.data.user,
        // Do not log token contents
      },
    });
    
    return response.data;
  } catch (error) {
    console.log('[AUTH] Login error', {
      message: error?.message,
      code: error?.code,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      status: error?.response?.status,
      detail: error?.response?.data,
    });
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

/** Award a single badge (e.g. altitude_aware when user acknowledges altitude warning) */
export const awardBadge = async (badgeId) => {
  const response = await api.post('/api/auth/me/badges', { badge_id: badgeId });
  return response.data;
};





