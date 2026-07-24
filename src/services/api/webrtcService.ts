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
 * End WebRTC call (for internal use by PusherSignalingService)
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

/**
 * End any type of consultation (Chat, Audio, Video)
 * This API notifies the other side via Pusher event 'consultation-end'
 */
export interface EndConsultationRequest {
  consultationID: number;
  duration: string; // e.g., "20 min" or "30 min"
  from: string; // e.g., "doctor_33" or "patient_62"
  to: string; // e.g., "patient_62" or "doctor_33"
  offer?: { type: string; sdp: string }; // Optional, for WebRTC compatibility
}

export const endConsultation = async (data: EndConsultationRequest) => {
  try {
    const response = await apiClient.post('/webrtc/consultation-end', data);
    console.log('End consultation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error ending consultation:', error);
    throw error;
  }
};
