import { pusherService } from '../pusher/PusherService';

/**
 * PusherSignalingService - Handles WebRTC signaling through Pusher
 * 
 * This service manages WebRTC signaling using Pusher private channels
 * instead of Socket.IO. It's designed to work with Laravel backend.
 */

export interface SignalingCallbacks {
    onOffer?: (offer: RTCSessionDescriptionInit, from: string) => void;
    onAnswer?: (answer: RTCSessionDescriptionInit, from: string) => void;
    onIceCandidate?: (candidate: RTCIceCandidateInit, from: string) => void;
    onCallEnded?: (endedBy: string) => void;
    onUserJoined?: (userId: string) => void;
    onUserLeft?: (userId: string) => void;
    onCallRejected?: () => void;
    onError?: (error: string) => void;
}

class PusherSignalingService {
    private callbacks: SignalingCallbacks = {};
    private roomId: string | null = null;
    private userId: string | null = null;
    private channel: any = null;
    private channelName: string | null = null;
    private remoteUserId: string | null = null;

    /**
     * Connect to signaling (initialize Pusher if needed)
     */
    connect(userId: string, callbacks: SignalingCallbacks): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔌 [PusherSignaling] connect() called with userId:', userId);
                this.userId = userId;
                this.callbacks = callbacks;

                // Ensure Pusher is initialized
                pusherService.initialize();

                // Check connection status
                if (pusherService.getConnectionStatus()) {
                    console.log('✅ [PusherSignaling] Connected to Pusher');
                    resolve();
                } else {
                    // Wait for connection
                    const pusher = pusherService.getInstance();
                    if (pusher) {
                        pusher.connection.bind('connected', () => {
                            console.log('✅ [PusherSignaling] Connected to Pusher');
                            resolve();
                        });

                        pusher.connection.bind('error', (error: any) => {
                            console.error('❌ [PusherSignaling] Connection error:', error);
                            this.callbacks.onError?.('Failed to connect to Pusher');
                            reject(error);
                        });
                    } else {
                        reject(new Error('Failed to initialize Pusher'));
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Extract numeric consultation ID from roomId
     * Handles formats like: "consultation_2", "consultation2", "2"
     */
    private extractConsultationId(roomId: string | null | undefined): number | null {
        if (!roomId) {
            return null;
        }
        // Try to extract numeric ID from various formats
        const match = roomId.match(/(\d+)$/);
        if (match) {
            return parseInt(match[1], 10);
        }
        // If roomId is already a number, parse it directly
        const numericId = parseInt(roomId, 10);
        if (!isNaN(numericId)) {
            return numericId;
        }
        return null;
    }

    /**
     * Join a consultation room (subscribe to private channel)
     */
    joinRoom(roomId: string): void {
        if (!this.userId) {
            console.error('❌ [PusherSignaling] userId not set');
            return;
        }

        this.roomId = roomId;
        // Extract numeric consultation ID and use backend format: webrtc-consultation{id}
        const consultationId = this.extractConsultationId(roomId);
        if (!consultationId) {
            console.error('❌ [PusherSignaling] Invalid roomId format:', roomId);
            return;
        }

        // Backend uses format: webrtc-consultation{id} (PUBLIC channel - no authorization needed)
        const channelName = `webrtc-consultation${consultationId}`;

        console.log(`📡 [PusherSignaling] Joining room: ${roomId} (consultationID: ${consultationId}, channel: ${channelName})`);

        // Store channel name for bind() calls
        this.channelName = channelName;

        // Subscribe to public channel (no authorization required)
        this.channel = pusherService.subscribe(channelName);

        // Setup event listeners
        this.setupEventListeners();

        // Don't notify onUserJoined for local user - wait for remote user to join
    }

    /**
     * Setup all signaling event listeners
     */
    private setupEventListeners() {
        if (!this.channel || !this.channelName) return;

        // Helper to extract payload
        const getPayload = (data: any) => {
            return (data && data.data) ? data.data : data;
        };

        // Handle offer from remote peer
        pusherService.bind(this.channelName, 'webrtc-offer', (data: any) => {
            console.log('📥 [PusherSignaling] Received offer:', data);
            const payload = getPayload(data);
            if (payload.from !== this.userId && payload.offer) {
                this.remoteUserId = payload.from;
                this.callbacks.onOffer?.(payload.offer, payload.from);
            }
        });

        // Handle answer from remote peer
        pusherService.bind(this.channelName, 'webrtc-answer', (data: any) => {
            console.log('📥 [PusherSignaling] Received answer:', data);
            const payload = getPayload(data);
            if (payload.from !== this.userId && payload.answer) {
                this.callbacks.onAnswer?.(payload.answer, payload.from);
            }
        });

        // Handle ICE candidate from remote peer
        pusherService.bind(this.channelName, 'webrtc-ice-candidate', (data: any) => {
            console.log('📥 [PusherSignaling] Received ICE candidate:', data);
            const payload = getPayload(data);
            if (payload.from !== this.userId && payload.candidate) {
                this.callbacks.onIceCandidate?.(payload.candidate, payload.from);
            }
        });

        // Handle call started event
        pusherService.bind(this.channelName, 'webrtc-call-started', (data: any) => {
            console.log('📞 [PusherSignaling] Call started event data:', data);
            const payload = getPayload(data);
            const initiator = payload.initiator || payload.from;
            if (initiator && initiator !== this.userId) {
                this.remoteUserId = initiator;
                this.callbacks.onUserJoined?.(initiator);
            }
        });

        // Handle call ended event
        pusherService.bind(this.channelName, 'webrtc-call-ended', (data: any) => {
            console.log('📞 [PusherSignaling] Call ended event received:', data);
            const payload = getPayload(data);
            const endedBy = payload.endedBy || payload.from || 'unknown';
            console.log('📞 [PusherSignaling] Call ended by:', endedBy);
            this.callbacks.onCallEnded?.(endedBy);
        });

        // Handle call rejected event
        pusherService.bind(this.channelName, 'webrtc-call-rejected', (data: any) => {
            console.log('❌ [PusherSignaling] Call rejected');
            this.callbacks.onCallRejected?.();
        });

        // Handle user left event
        pusherService.bind(this.channelName, 'webrtc-user-left', (data: any) => {
            console.log('👋 [PusherSignaling] User left:', data.userId);
            const payload = getPayload(data);
            if (payload.userId !== this.userId) {
                this.callbacks.onUserLeft?.(payload.userId);
            }
        });
    }

    /**
     * Leave the current room
     */
    leaveRoom(): void {
        if (this.roomId) {
            const consultationId = this.extractConsultationId(this.roomId);
            if (consultationId) {
                const channelName = `webrtc-consultation${consultationId}`;
                pusherService.unsubscribe(channelName);
            }
            this.channel = null;
            this.channelName = null;
            this.roomId = null;
            console.log('👋 [PusherSignaling] Left room');
        }
    }

    /**
     * Send offer to remote peer (via Laravel backend)
     * Note: In Laravel, you'll need to trigger the event via API or use client events
     */
    async sendOffer(offer: RTCSessionDescriptionInit, to: string): Promise<void> {
        if (!this.roomId || !this.userId) {
            console.error('❌ [PusherSignaling] Cannot send offer: roomId or userId not set');
            return;
        }

        console.log('📤 [PusherSignaling] Sending offer to:', to);

        // Import webrtcService dynamically to avoid circular dependencies
        const { sendWebRTCOffer } = await import('../api/webrtcService');

        try {
            const consultationID = this.extractConsultationId(this.roomId);
            if (!consultationID) {
                throw new Error('Invalid consultation ID');
            }
            await sendWebRTCOffer({
                consultationID: consultationID,
                from: this.userId,
                to: to,
                offer: offer,
            });
            console.log('✅ [PusherSignaling] Offer sent via API');
        } catch (error) {
            console.error('❌ [PusherSignaling] Failed to send offer:', error);
            this.callbacks.onError?.('Failed to send offer');
        }
    }

    /**
     * Send answer to remote peer
     */
    async sendAnswer(answer: RTCSessionDescriptionInit, to: string): Promise<void> {
        if (!this.roomId || !this.userId) {
            console.error('❌ [PusherSignaling] Cannot send answer: roomId or userId not set');
            return;
        }

        console.log('📤 [PusherSignaling] Sending answer to:', to);

        const { sendWebRTCAnswer } = await import('../api/webrtcService');

        try {
            const consultationID = this.extractConsultationId(this.roomId);
            if (!consultationID) {
                throw new Error('Invalid consultation ID');
            }
            await sendWebRTCAnswer({
                consultationID: consultationID,
                from: this.userId,
                to: to,
                answer: answer,
            });
            console.log('✅ [PusherSignaling] Answer sent via API');
        } catch (error) {
            console.error('❌ [PusherSignaling] Failed to send answer:', error);
            this.callbacks.onError?.('Failed to send answer');
        }
    }

    /**
     * Send ICE candidate to remote peer
     */
    async sendIceCandidate(candidate: RTCIceCandidateInit, to: string): Promise<void> {
        if (!this.roomId || !this.userId) {
            return;
        }

        const { sendWebRTCIceCandidate } = await import('../api/webrtcService');

        try {
            const consultationID = this.extractConsultationId(this.roomId);
            if (!consultationID) {
                return;
            }
            await sendWebRTCIceCandidate({
                consultationID: consultationID,
                from: this.userId,
                to: to,
                candidate: candidate,
            });
        } catch (error) {
            console.error('❌ [PusherSignaling] Failed to send ICE candidate:', error);
        }
    }

    /**
     * End the call
     */
    async endCall(): Promise<void> {
        // Store roomId and userId before leaveRoom() clears them
        const currentRoomId = this.roomId;
        const currentUserId = this.userId;

        if (!currentRoomId || !currentUserId) {
            console.log('📞 [PusherSignaling] No active call to end (roomId or userId missing)');
            // Still try to leave room if we're subscribed to a channel
            this.leaveRoom();
            return;
        }

        console.log('📞 [PusherSignaling] Ending call');

        const { endWebRTCCall } = await import('../api/webrtcService');

        try {
            const consultationID = this.extractConsultationId(currentRoomId);
            if (consultationID) {
                // Notify backend that call has ended (this will notify the other side via Pusher)
                await endWebRTCCall(consultationID, currentUserId);
                console.log('✅ [PusherSignaling] Call ended notification sent to backend');
            } else {
                console.warn('⚠️ [PusherSignaling] Could not extract consultation ID from roomId:', currentRoomId);
            }
        } catch (error) {
            console.error('❌ [PusherSignaling] Failed to end call:', error);
        }

        // Leave room after notifying backend
        this.leaveRoom();
    }

    /**
     * Reject an incoming call
     */
    rejectCall(): void {
        if (!this.roomId || !this.userId) {
            return;
        }

        console.log('❌ [PusherSignaling] Rejecting call');
        this.leaveRoom();
    }

    /**
     * Disconnect from signaling
     */
    disconnect(): void {
        this.leaveRoom();
        this.userId = null;
        this.remoteUserId = null;
        this.callbacks = {};
        console.log('🔌 [PusherSignaling] Disconnected');
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return pusherService.getConnectionStatus() && this.channel !== null;
    }
}

// Export singleton instance
export default new PusherSignalingService();
