// services/api/api-client.ts
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';


export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('[API Request]', config.method?.toUpperCase(), (config.baseURL ?? '') + (config.url ?? ''));
  console.log('[API Headers]', JSON.stringify(config.headers));
  if (config.data) console.log('[API Body]', config.data);

  // If data is FormData, ensure headers are correct for React Native
  // Check for FormData instance or if data has FormData-like structure (React Native FormData)
  const isFormData = config.data instanceof FormData ||
    (config.data && typeof config.data === 'object' && config.data._parts);

  if (isFormData) {
    // Remove Content-Type header completely - React Native will set it automatically with boundary
    delete config.headers['Content-Type'];
    // Don't set Accept header - let it default
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('[API] 401 Unauthenticated — logging out user');
      useAuthStore.getState().logout();
    }

    const normalizedError = {
      status,
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  },
);
