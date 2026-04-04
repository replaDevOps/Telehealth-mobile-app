const VENA_AI_BASE_URL = 'https://ai-modal.repla-projects.com';
const VENA_AI_API_KEY = 'm8QYIGiVfmuEFBdeCfIuTdpTGk';

export interface VenaAIStartSessionParams {
  sessionId: string;
  patientId: string;
  clinicId?: number;
  dataSource?: 'cache-first' | 'live' | 'cache-only';
  userInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    preferences?: string[];
    language?: string;
  };
}

export interface VenaAIStartSessionResponse {
  sessionId: string;
  clinicId?: number;
  contextSource: string;
  userInfo: any;
  contextCounts: { services: number; doctors: number; devices: number };
}

export interface VenaAIServiceItem {
  id: number;
  name: string;
  clinicName?: string;
  priceDisplay?: string;
  feeDisplay?: string;
}

export interface VenaAIAssistantData {
  sessionId: string;
  clinicId?: number;
  contextSource: string;
  reply: string;
  suggestions: {
    services: VenaAIServiceItem[];
    doctors: any[];
    devices: any[];
    meta: { showCards: boolean };
  };
  catalog: {
    clinics: any[];
    services: any[];
  };
  history: any[];
}

export interface VenaAIWebSocketEvent {
  type: 'connected' | 'assistant_message' | 'pong' | 'error';
  data?: VenaAIAssistantData;
  error?: string;
  sessionId?: string;
  clinicId?: number;
  dataSource?: string;
  timestamp?: string;
}

class VenaAIService {
  private baseUrl = VENA_AI_BASE_URL;
  private apiKey = VENA_AI_API_KEY;

  private get jsonHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async startSession(
    params: VenaAIStartSessionParams,
  ): Promise<VenaAIStartSessionResponse> {
    const body: Record<string, any> = {
      sessionId: params.sessionId,
      patientId: params.patientId,
      dataSource: params.dataSource ?? 'cache-first',
    };
    if (params.clinicId) body.clinicId = params.clinicId;
    if (params.userInfo) body.userInfo = params.userInfo;

    const response = await fetch(`${this.baseUrl}/api/venaai/chat/start`, {
      method: 'POST',
      headers: this.jsonHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Session start failed: ${response.status}`);
    }
    return response.json();
  }

  async getSessionHistory(sessionId: string): Promise<any | null> {
    const response = await fetch(
      `${this.baseUrl}/api/venaai/chat/sessions/${encodeURIComponent(sessionId)}`,
      { headers: this.jsonHeaders },
    );
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`History fetch failed: ${response.status}`);
    return response.json();
  }

  async sendMessageHTTP(params: {
    sessionId: string;
    patientId: string;
    clinicId?: number;
    message?: string;
    details?: string;
    preferredLanguage?: string;
    dataSource?: string;
  }): Promise<VenaAIAssistantData> {
    const body: Record<string, any> = {
      sessionId: params.sessionId,
      patientId: params.patientId,
      dataSource: params.dataSource ?? 'cache-first',
      preferredLanguage: params.preferredLanguage ?? 'en',
    };
    if (params.clinicId) body.clinicId = params.clinicId;
    if (params.message) body.message = params.message;
    if (params.details) body.details = params.details;

    const response = await fetch(`${this.baseUrl}/api/venaai/chat`, {
      method: 'POST',
      headers: this.jsonHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Chat request failed: ${response.status}`);
    }
    return response.json();
  }

  async uploadImageWithMessage(params: {
    sessionId: string;
    patientId: string;
    clinicId?: number;
    message?: string;
    details?: string;
    preferredLanguage?: string;
    imageUri: string;
    imageName: string;
    imageType: string;
  }): Promise<VenaAIAssistantData> {
    const formData = new FormData();
    formData.append('sessionId', params.sessionId);
    formData.append('patientId', params.patientId);
    formData.append('dataSource', 'cache-first');
    formData.append('preferredLanguage', params.preferredLanguage ?? 'en');
    if (params.clinicId) formData.append('clinicId', String(params.clinicId));
    if (params.message) formData.append('message', params.message);
    if (params.details) formData.append('details', params.details);
    formData.append('image', {
      uri: params.imageUri,
      name: params.imageName,
      type: params.imageType,
    } as any);

    const response = await fetch(`${this.baseUrl}/api/venaai/chat/upload`, {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Image upload failed: ${response.status}`);
    }
    return response.json();
  }

  buildWebSocketUrl(params: {
    sessionId: string;
    patientId: string;
    clinicId?: number;
    lang?: string;
    dataSource?: string;
  }): string {
    const wsBase = this.baseUrl
      .replace(/^http:/, 'ws:')
      .replace(/^https:/, 'wss:');
    const query = new URLSearchParams({
      sessionId: params.sessionId,
      patientId: params.patientId,
      lang: params.lang ?? 'en',
      dataSource: params.dataSource ?? 'cache-first',
      apiKey: this.apiKey,
    });
    if (params.clinicId) query.set('clinicId', String(params.clinicId));
    return `${wsBase}/ws/chat?${query.toString()}`;
  }
}

export const venaAIService = new VenaAIService();
