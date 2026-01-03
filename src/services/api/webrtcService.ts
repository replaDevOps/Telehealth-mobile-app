import { apiClient } from './api-client';

export interface SendOfferRequest {
  consultationID: number;
  to: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerRequest {
  consultationID: number;
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateRequest {
  consultationID: number;
  to: string;
  candidate: RTCIceCandidateInit;
}

/**
 * Send WebRTC offer
 */
export const sendWebRTCOffer = async (data: SendOfferRequest) => {
  try {
    const response = await apiClient.post('/webrtc/offer', data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending WebRTC offer:', error);
    throw error;
  }
};

/**
 * Send WebRTC answer
 */
export const sendWebRTCAnswer = async (data: SendAnswerRequest) => {
  try {
    const response = await apiClient.post('/webrtc/answer', data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending WebRTC answer:', error);
    throw error;
  }
};

/**
 * Send ICE candidate
 */
export const sendWebRTCIceCandidate = async (data: SendIceCandidateRequest) => {
  try {
    const response = await apiClient.post('/webrtc/ice-candidate', data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending ICE candidate:', error);
    throw error;
  }
};

/**
 * Start WebRTC call
 */
export const startWebRTCCall = async (consultationID: number, type: 'audio' | 'video') => {
  try {
    const response = await apiClient.post('/webrtc/start-call', {
      consultationID,
      type,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error starting WebRTC call:', error);
    throw error;
  }
};

/**
 * End WebRTC call
 */
export const endWebRTCCall = async (consultationID: number) => {
  try {
    const response = await apiClient.post('/webrtc/end-call', {
      consultationID,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error ending WebRTC call:', error);
    throw error;
  }
};
