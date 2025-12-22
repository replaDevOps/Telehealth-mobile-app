// services/api/api-client.ts
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().auth?.user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    const normalizedError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  },
);
