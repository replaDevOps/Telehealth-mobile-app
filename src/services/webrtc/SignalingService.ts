import { io, Socket } from 'socket.io-client';

/**
 * SignalingService - Handles WebRTC signaling through Socket.IO
 * 
 * This service manages the connection to the signaling server and handles
 * all signaling events for WebRTC peer connections.
 */

export interface SignalingCallbacks {
    onOffer?: (offer: RTCSessionDescriptionInit) => void;
    onAnswer?: (answer: RTCSessionDescriptionInit) => void;
    onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
    onCallEnded?: () => void;
    onUserJoined?: (userId: string) => void;
    onUserLeft?: (userId: string) => void;
    onCallRejected?: () => void;
    onError?: (error: string) => void;
}

class SignalingService {
    private socket: Socket | null = null;
    private serverUrl: string;
    private callbacks: SignalingCallbacks = {};
    private roomId: string | null = null;
    private userId: string | null = null;

    constructor(serverUrl: string = 'https://5b7dbf2df5b6.ngrok-free.app') {
        this.serverUrl = serverUrl;
    }

    /**
     * Connect to the signaling server
     */
    connect(userId: string, callbacks: SignalingCallbacks): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.userId = userId;
                this.callbacks = callbacks;

                this.socket = io(this.serverUrl, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                });

                this.socket.on('connect', () => {
                    console.log('Connected to signaling server');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    this.callbacks.onError?.('Failed to connect to signaling server');
                    reject(error);
                });

                this.setupEventListeners();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Setup all signaling event listeners
     */
    private setupEventListeners() {
        if (!this.socket) return;

        // Handle offer from remote peer
        this.socket.on('offer', (data: { offer: RTCSessionDescriptionInit; from: string }) => {
            console.log('Received offer from:', data.from);
            this.callbacks.onOffer?.(data.offer);
        });

        // Handle answer from remote peer
        this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit; from: string }) => {
            console.log('Received answer from:', data.from);
            this.callbacks.onAnswer?.(data.answer);
        });

        // Handle ICE candidate from remote peer
        this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit; from: string }) => {
            console.log('Received ICE candidate from:', data.from);
            this.callbacks.onIceCandidate?.(data.candidate);
        });

        // Handle user joined event
        this.socket.on('user-joined', (data: { userId: string }) => {
            console.log('User joined:', data.userId);
            this.callbacks.onUserJoined?.(data.userId);
        });

        // Handle user left event
        this.socket.on('user-left', (data: { userId: string }) => {
            console.log('User left:', data.userId);
            this.callbacks.onUserLeft?.(data.userId);
        });

        // Handle call ended event
        this.socket.on('call-ended', () => {
            console.log('Call ended by remote peer');
            this.callbacks.onCallEnded?.();
        });

        // Handle call rejected event
        this.socket.on('call-rejected', () => {
            console.log('Call rejected');
            this.callbacks.onCallRejected?.();
        });

        // Handle errors
        this.socket.on('error', (error: string) => {
            console.error('Signaling error:', error);
            this.callbacks.onError?.(error);
        });

        // Handle disconnection
        this.socket.on('disconnect', () => {
            console.log('Disconnected from signaling server');
            this.callbacks.onError?.('Disconnected from server');
        });
    }

    /**
     * Join a consultation room
     */
    joinRoom(roomId: string): void {
        if (!this.socket || !this.userId) {
            console.error('Socket not connected or userId not set');
            return;
        }

        this.roomId = roomId;
        this.socket.emit('join-room', { roomId, userId: this.userId });
        console.log('Joining room:', roomId);
    }

    /**
     * Leave the current room
     */
    leaveRoom(): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('leave-room', { roomId: this.roomId, userId: this.userId });
        this.roomId = null;
        console.log('Left room');
    }

    /**
     * Send offer to remote peer
     */
    sendOffer(offer: RTCSessionDescriptionInit, to: string): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('offer', {
            roomId: this.roomId,
            offer,
            to,
            from: this.userId,
        });
        console.log('Sent offer to:', to);
    }

    /**
     * Send answer to remote peer
     */
    sendAnswer(answer: RTCSessionDescriptionInit, to: string): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('answer', {
            roomId: this.roomId,
            answer,
            to,
            from: this.userId,
        });
        console.log('Sent answer to:', to);
    }

    /**
     * Send ICE candidate to remote peer
     */
    sendIceCandidate(candidate: RTCIceCandidateInit, to: string): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('ice-candidate', {
            roomId: this.roomId,
            candidate,
            to,
            from: this.userId,
        });
    }

    /**
     * End the call
     */
    endCall(): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('end-call', { roomId: this.roomId, userId: this.userId });
        console.log('Ended call');
    }

    /**
     * Reject an incoming call
     */
    rejectCall(): void {
        if (!this.socket || !this.roomId) return;

        this.socket.emit('reject-call', { roomId: this.roomId, userId: this.userId });
        console.log('Rejected call');
    }

    /**
     * Disconnect from the signaling server
     */
    disconnect(): void {
        if (this.socket) {
            this.leaveRoom();
            this.socket.disconnect();
            this.socket = null;
            this.roomId = null;
            this.userId = null;
            console.log('Disconnected from signaling server');
        }
    }

    /**
     * Check if connected to signaling server
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

// Export singleton instance
export default new SignalingService();
