import { apiClient } from './api-client';

export interface SendOfferRequest {
  consultationID: number;
  from: string;
  to: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerRequest {
  consultationID: number;
  from: string;
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateRequest {
  consultationID: number;
  from: string;
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
export const startWebRTCCall = async (consultationID: number, from: string, type: 'audio' | 'video') => {
  try {
    const response = await apiClient.post('/webrtc/call-started', {
      consultationID,
      from,
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
export const endWebRTCCall = async (consultationID: number, from: string) => {
  try {
    const response = await apiClient.post('/webrtc/call-ended', {
      consultationID,
      from,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error ending WebRTC call:', error);
    throw error;
  }
};
