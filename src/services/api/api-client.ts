// api-client.ts
import axios from 'axios';
import { useAuthStore } from '@store';
import { BASE_URL } from '@constants';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const { auth } = useAuthStore.getState();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});


apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(error),
);

export default apiClient;
