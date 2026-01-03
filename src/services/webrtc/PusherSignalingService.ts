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
    private remoteUserId: string | null = null;

    /**
     * Connect to signaling (initialize Pusher if needed)
     */
    connect(userId: string, callbacks: SignalingCallbacks): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
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
     * Join a consultation room (subscribe to private channel)
     */
    joinRoom(roomId: string): void {
        if (!this.userId) {
            console.error('❌ [PusherSignaling] userId not set');
            return;
        }

        this.roomId = roomId;
        const channelName = `private-webrtc-consultation${roomId}`;

        console.log(`📡 [PusherSignaling] Joining room: ${roomId} (channel: ${channelName})`);

        // Subscribe to private channel
        this.channel = pusherService.subscribe(channelName);

        // Setup event listeners
        this.setupEventListeners();

        // Don't notify onUserJoined for local user - wait for remote user to join
    }

    /**
     * Setup all signaling event listeners
     */
    private setupEventListeners() {
        if (!this.channel) return;

        // Handle offer from remote peer
        pusherService.bind(this.channel, 'webrtc-offer', (data: any) => {
            console.log('📥 [PusherSignaling] Received offer from:', data.from);
            if (data.from !== this.userId && data.offer) {
                this.remoteUserId = data.from;
                this.callbacks.onOffer?.(data.offer, data.from);
            }
        });

        // Handle answer from remote peer
        pusherService.bind(this.channel, 'webrtc-answer', (data: any) => {
            console.log('📥 [PusherSignaling] Received answer from:', data.from);
            if (data.from !== this.userId && data.answer) {
                this.callbacks.onAnswer?.(data.answer, data.from);
            }
        });

        // Handle ICE candidate from remote peer
        pusherService.bind(this.channel, 'webrtc-ice-candidate', (data: any) => {
            console.log('📥 [PusherSignaling] Received ICE candidate from:', data.from);
            if (data.from !== this.userId && data.candidate) {
                this.callbacks.onIceCandidate?.(data.candidate, data.from);
            }
        });

        // Handle call started event
        pusherService.bind(this.channel, 'webrtc-call-started', (data: any) => {
            console.log('📞 [PusherSignaling] Call started by:', data.initiator);
            if (data.initiator !== this.userId) {
                this.remoteUserId = data.initiator;
                this.callbacks.onUserJoined?.(data.initiator);
            }
        });

        // Handle call ended event
        pusherService.bind(this.channel, 'webrtc-call-ended', (data: any) => {
            console.log('📞 [PusherSignaling] Call ended by:', data.endedBy);
            this.callbacks.onCallEnded?.(data.endedBy || 'unknown');
        });

        // Handle call rejected event
        pusherService.bind(this.channel, 'webrtc-call-rejected', (data: any) => {
            console.log('❌ [PusherSignaling] Call rejected');
            this.callbacks.onCallRejected?.();
        });

        // Handle user left event
        pusherService.bind(this.channel, 'webrtc-user-left', (data: any) => {
            console.log('👋 [PusherSignaling] User left:', data.userId);
            if (data.userId !== this.userId) {
                this.callbacks.onUserLeft?.(data.userId);
            }
        });
    }

    /**
     * Leave the current room
     */
    leaveRoom(): void {
        if (this.roomId) {
            const channelName = `private-webrtc-consultation${this.roomId}`;
            pusherService.unsubscribe(channelName);
            this.channel = null;
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

        // For private channels, we need to trigger via Laravel backend
        // The frontend will call an API endpoint that triggers the Pusher event
        console.log('📤 [PusherSignaling] Sending offer to:', to);
        
        // Import webrtcService dynamically to avoid circular dependencies
        const { sendWebRTCOffer } = await import('../api/webrtcService');
        
        try {
            const consultationID = parseInt(this.roomId.replace('consultation_', ''));
            await sendWebRTCOffer({
                consultationID: consultationID,
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
            const consultationID = parseInt(this.roomId.replace('consultation_', ''));
            await sendWebRTCAnswer({
                consultationID: consultationID,
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
            const consultationID = parseInt(this.roomId.replace('consultation_', ''));
            await sendWebRTCIceCandidate({
                consultationID: consultationID,
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
        if (!this.roomId || !this.userId) {
            return;
        }

        console.log('📞 [PusherSignaling] Ending call');

        const { endWebRTCCall } = await import('../api/webrtcService');
        
        try {
            const consultationID = parseInt(this.roomId.replace('consultation_', ''));
            await endWebRTCCall(consultationID);
        } catch (error) {
            console.error('❌ [PusherSignaling] Failed to end call:', error);
        }

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
