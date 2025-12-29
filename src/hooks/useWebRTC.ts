import { useState, useEffect, useRef, useCallback } from 'react';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
    mediaDevices,
    RTCView,
} from 'react-native-webrtc';
import SignalingService, { SignalingCallbacks } from '../services/webrtc/SignalingService';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Configuration for STUN/TURN servers
 * Replace with your own TURN server for production
 */
const ICE_SERVERS = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
        // Add TURN servers for production
        // {
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'username',
        //   credential: 'password',
        // },
    ],
};

export interface UseWebRTCOptions {
    userId: string;
    roomId: string;
    isVideoEnabled?: boolean;
    isAudioEnabled?: boolean;
    signalingServerUrl?: string;
}

export interface UseWebRTCReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isConnected: boolean;
    isConnecting: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    isReady: boolean; // Add isReady state
    error: string | null;
    toggleMute: () => void;
    toggleVideo: () => void;
    switchCamera: () => void;
    startCall: () => Promise<void>;
    endCall: () => void;
    joinCall: () => Promise<void>;
}

/**
 * Custom hook for WebRTC functionality
 * 
 * This hook manages the entire WebRTC connection lifecycle including:
 * - Requesting media permissions
 * - Creating and managing peer connections
 * - Handling signaling through SignalingService
 * - Managing local and remote media streams
 */
export const useWebRTC = ({
    userId,
    roomId,
    isVideoEnabled = true,
    isAudioEnabled = true,
    signalingServerUrl,
}: UseWebRTCOptions): UseWebRTCReturn => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(!isAudioEnabled);
    const [isVideoOff, setIsVideoOff] = useState(!isVideoEnabled);
    const [isReady, setIsReady] = useState(false); // Track initialization status
    const [error, setError] = useState<string | null>(null);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const remoteUserId = useRef<string | null>(null);

    /**
     * Request camera and microphone permissions
     */
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);

                const cameraGranted =
                    granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
                const audioGranted =
                    granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
                    PermissionsAndroid.RESULTS.GRANTED;

                return cameraGranted && audioGranted;
            } catch (err) {
                console.error('Permission request error:', err);
                return false;
            }
        }
        return true;
    };

    /**
     * Get user media stream
     */
    const getUserMedia = async (): Promise<MediaStream | null> => {
        try {
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                setError('Camera and microphone permissions are required');
                return null;
            }

            const constraints: any = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            };

            // Only request video if enabled
            if (isVideoEnabled) {
                constraints.video = {
                    facingMode: isFrontCamera ? 'user' : 'environment',
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 },
                };
            }

            const stream = await mediaDevices.getUserMedia(constraints);

            // Set initial mute states
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });

            if (isVideoEnabled) {
                stream.getVideoTracks().forEach(track => {
                    track.enabled = !isVideoOff;
                });
            }

            return stream as MediaStream;
        } catch (err) {
            console.error('Error getting user media:', err);
            setError('Failed to access camera/microphone');
            return null;
        }
    };

    /**
     * Create RTCPeerConnection
     */
    const createPeerConnection = useCallback(() => {
        try {
            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && remoteUserId.current) {
                    SignalingService.sendIceCandidate(
                        event.candidate.toJSON(),
                        remoteUserId.current
                    );
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log('Connection state:', pc.connectionState);
                switch (pc.connectionState) {
                    case 'connected':
                        setIsConnected(true);
                        setIsConnecting(false);
                        setError(null);
                        break;
                    case 'disconnected':
                    case 'failed':
                        setIsConnected(false);
                        setError('Connection failed');
                        break;
                    case 'closed':
                        setIsConnected(false);
                        break;
                }
            };

            // Handle incoming remote stream
            pc.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            };

            peerConnection.current = pc;
            return pc;
        } catch (err) {
            console.error('Error creating peer connection:', err);
            setError('Failed to create peer connection');
            return null;
        }
    }, []);

    /**
     * Setup signaling callbacks
     */
    const setupSignalingCallbacks = useCallback((): SignalingCallbacks => {
        return {
            onOffer: async (offer) => {
                try {
                    if (!peerConnection.current) {
                        createPeerConnection();
                    }

                    const pc = peerConnection.current;
                    if (!pc) return;

                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    if (remoteUserId.current) {
                        SignalingService.sendAnswer(answer.toJSON(), remoteUserId.current);
                    }
                } catch (err) {
                    console.error('Error handling offer:', err);
                    setError('Failed to handle incoming call');
                }
            },

            onAnswer: async (answer) => {
                try {
                    const pc = peerConnection.current;
                    if (!pc) return;

                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error('Error handling answer:', err);
                    setError('Failed to establish connection');
                }
            },

            onIceCandidate: async (candidate) => {
                try {
                    const pc = peerConnection.current;
                    if (!pc) return;

                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            },

            onUserJoined: (userId) => {
                console.log('User joined:', userId);
                remoteUserId.current = userId;
            },

            onUserLeft: () => {
                console.log('User left');
                endCall();
            },

            onCallEnded: () => {
                console.log('Call ended');
                endCall();
            },

            onCallRejected: () => {
                setError('Call was rejected');
                endCall();
            },

            onError: (errorMsg) => {
                setError(errorMsg);
            },
        };
    }, [createPeerConnection]);

    /**
     * Initialize WebRTC
     */
    const initialize = async () => {
        try {
            console.log('Initializing WebRTC...');

            // Connect to signaling server
            await SignalingService.connect(userId, setupSignalingCallbacks());

            // Get local media stream
            const stream = await getUserMedia();
            if (stream) {
                setLocalStream(stream);
                setIsReady(true); // Mark as ready after successful initialization
                console.log('WebRTC initialized successfully');
            } else {
                setError('Failed to get media stream');
            }
        } catch (err) {
            console.error('Initialization error:', err);
            setError('Failed to initialize call');
        }
    };

    /**
     * Start a new call (create offer)
     */
    const startCall = async () => {
        try {
            // Wait for initialization if not ready
            if (!isReady || !localStream) {
                console.log('Waiting for initialization...');
                setIsConnecting(true);
                return;
            }

            console.log('Starting call...');
            setIsConnecting(true);
            setError(null);

            // Join the room
            SignalingService.joinRoom(roomId);

            // Create peer connection
            const pc = createPeerConnection();
            if (!pc) {
                throw new Error('Failed to create peer connection');
            }

            // Add local stream to peer connection
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });

            // Create and send offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: isVideoEnabled,
            });

            await pc.setLocalDescription(offer);
            console.log('Call started successfully');
        } catch (err) {
            console.error('Error starting call:', err);
            setError('Failed to start call');
            setIsConnecting(false);
        }
    };

    /**
     * Join an existing call (wait for offer)
     */
    const joinCall = async () => {
        try {
            // Wait for initialization if not ready
            if (!isReady || !localStream) {
                console.log('Waiting for initialization...');
                setIsConnecting(true);
                return;
            }

            console.log('Joining call...');
            setIsConnecting(true);
            setError(null);

            // Join the room
            SignalingService.joinRoom(roomId);

            // Create peer connection
            const pc = createPeerConnection();
            if (!pc) {
                throw new Error('Failed to create peer connection');
            }

            // Add local stream to peer connection
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });

            console.log('Joined call successfully, waiting for offer');
        } catch (err) {
            console.error('Error joining call:', err);
            setError('Failed to join call');
            setIsConnecting(false);
        }
    };

    /**
     * End the call
     */
    const endCall = useCallback(() => {
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        // Stop remote stream
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Leave room and disconnect from signaling
        SignalingService.endCall();
        SignalingService.leaveRoom();

        // Reset state
        setIsConnected(false);
        setIsConnecting(false);
        remoteUserId.current = null;
    }, [localStream, remoteStream]);

    /**
     * Toggle microphone mute
     */
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    /**
     * Toggle video on/off
     */
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [localStream]);

    /**
     * Switch between front and rear camera
     */
    const switchCamera = useCallback(async () => {
        if (localStream) {
            // Stop current video track
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.stop();
            }

            // Toggle camera
            setIsFrontCamera(!isFrontCamera);

            // Get new video stream with switched camera
            try {
                const newStream = await mediaDevices.getUserMedia({
                    video: {
                        facingMode: !isFrontCamera ? 'user' : 'environment',
                    },
                    audio: false,
                });

                const newVideoTrack = newStream.getVideoTracks()[0];

                // Replace the video track in peer connection
                if (peerConnection.current) {
                    const sender = peerConnection.current
                        .getSenders()
                        .find(s => s.track?.kind === 'video');

                    if (sender) {
                        await sender.replaceTrack(newVideoTrack);
                    }
                }

                // Update local stream
                localStream.removeTrack(videoTrack);
                localStream.addTrack(newVideoTrack);
                setLocalStream(new MediaStream(localStream.getTracks()));
            } catch (err) {
                console.error('Error switching camera:', err);
                setError('Failed to switch camera');
            }
        }
    }, [localStream, isFrontCamera]);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        initialize();

        return () => {
            endCall();
            SignalingService.disconnect();
        };
    }, []);

    return {
        localStream,
        remoteStream,
        isConnected,
        isConnecting,
        isMuted,
        isVideoOff,
        isReady,
        error,
        toggleMute,
        toggleVideo,
        switchCamera,
        startCall,
        endCall,
        joinCall,
    };
};
