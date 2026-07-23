import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';

export type CheckProfileResult = {
  ok: boolean;
  message?: string;
  raw?: any;
};

export const checkProfile = async (): Promise<CheckProfileResult> => {
  try {
    const res = await apiClient.get(API.CONSULTATIONS.CHECK_PROFILE);
    const data = res.data?.data || res.data;
    const isComplete = data?.is_complete ?? data?.isComplete ?? res.data?.success;
    const message = res.data?.message || (data && data.message) || undefined;
    return { ok: !!isComplete, message, raw: res };
  } catch (err: any) {
    // If check fails, return ok=true to avoid blocking user actions by default
    return { ok: true, message: err?.message || 'Check profile failed', raw: err };
  }
};
