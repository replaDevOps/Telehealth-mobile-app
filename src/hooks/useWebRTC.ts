import { useState, useEffect, useRef, useCallback } from 'react';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
    mediaDevices,
    RTCView,
} from 'react-native-webrtc';
import PusherSignalingService, { SignalingCallbacks } from '../services/webrtc/PusherSignalingService';
// Use PusherSignalingService instead of Socket.IO SignalingService
const SignalingService = PusherSignalingService;
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
    sdpSemantics: 'unified-plan' as any, // Required for modern WebRTC
};

export interface UseWebRTCOptions {
    userId: string;
    roomId: string;
    isVideoEnabled?: boolean;
    isAudioEnabled?: boolean;
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
}: UseWebRTCOptions): UseWebRTCReturn => {
    console.log('🪝 [useWebRTC] Hook called with:', { userId, roomId, isVideoEnabled, isAudioEnabled });

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
    const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
    const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

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
            console.log('🎤 [useWebRTC] getUserMedia: Requesting permissions...');
            const hasPermissions = await requestPermissions();
            console.log('🎤 [useWebRTC] getUserMedia: Permissions result:', hasPermissions);

            if (!hasPermissions) {
                console.error('❌ [useWebRTC] getUserMedia: Permissions denied!');
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
            // @ts-ignore
            pc.onicecandidate = (event) => {
                if (event.candidate && remoteUserId.current) {
                    // sendIceCandidate is now async, but we don't need to await it
                    SignalingService.sendIceCandidate(
                        event.candidate.toJSON(),
                        remoteUserId.current
                    ).catch(err => console.error('Error sending ICE candidate:', err));
                }
            };

            // Handle connection state changes
            // @ts-ignore
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
            // @ts-ignore
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
            onOffer: async (offer, from) => {
                try {
                    console.log('📝 [useWebRTC] onOffer received from:', from, 'with offer:', JSON.stringify(offer));

                    if (!peerConnection.current) {
                        createPeerConnection();
                    }

                    let pc = peerConnection.current;
                    if (!pc) {
                        createPeerConnection();
                        pc = peerConnection.current;
                    }
                    if (!pc) return;

                    // Store remote user ID
                    if (from) {
                        remoteUserId.current = from;
                    }

                    // Ensure local stream tracks are added to peer connection
                    if (localStream && pc.getSenders().length === 0) {
                        console.log('🎥 [useWebRTC] Adding local stream tracks before handling offer...');
                        localStream.getTracks().forEach(track => {
                            pc.addTrack(track, localStream);
                        });
                    }

                    // Handle Glare: If we have a local offer but receive a remote offer,
                    // we validly choose to be 'polite' (since we are receiving) and reset to accept.
                    if (pc.signalingState === 'have-local-offer') {
                        console.warn('⚠️ [useWebRTC] Glare detected! signalingState is "have-local-offer". Resetting PC to accept incoming offer.');
                        pc.close();
                        const newPc = createPeerConnection();
                        if (newPc) {
                            pc = newPc;
                            if (localStream) {
                                localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                            }
                        } else {
                            console.error('❌ [useWebRTC] Failed to recreate PeerConnection during glare handling');
                            return;
                        }
                    }

                    try {
                        // Ensure offer is an object with type and sdp
                        if (!offer || typeof offer !== 'object') {
                            throw new Error('Invalid offer format: offer is not an object');
                        }

                        // Extract type and sdp, handling nested structures
                        const offerType = offer.type || (offer as any).type;
                        let offerSdp = offer.sdp || (offer as any).sdp || '';

                        if (!offerType || !offerSdp) {
                            console.error('❌ [useWebRTC] Invalid offer structure:', {
                                hasType: !!offerType,
                                hasSdp: !!offerSdp,
                                offerKeys: Object.keys(offer),
                                offerType: typeof offer,
                            });
                            throw new Error(`Invalid offer: missing type (${!!offerType}) or sdp (${!!offerSdp})`);
                        }

                        // Ensure SDP is a string
                        let sdpString = String(offerSdp);
                        
                        // If SDP is a JSON stringified object, parse it first
                        if (sdpString.startsWith('{') || sdpString.startsWith('"')) {
                            try {
                                const parsed = JSON.parse(sdpString);
                                if (parsed.sdp) {
                                    sdpString = parsed.sdp;
                                } else if (typeof parsed === 'string') {
                                    sdpString = parsed;
                                }
                            } catch (e) {
                                // Not JSON, continue with original string
                            }
                        }

                        // Trim whitespace
                        sdpString = sdpString.trim();
                        
                        if (!sdpString || sdpString.length < 10) {
                            throw new Error(`Invalid SDP: too short (${sdpString.length} chars)`);
                        }

                        // Convert escaped newlines to actual newlines for react-native-webrtc
                        // Handle multiple levels of escaping: \\\\r\\\\n -> \\r\\n -> \r\n
                        sdpString = sdpString
                            .replace(/\\\\r\\\\n/g, '\r\n')  // Convert \\\\r\\\\n to \r\n (double-escaped)
                            .replace(/\\r\\n/g, '\r\n')       // Convert \\r\\n to \r\n (JSON escaped)
                            .replace(/\\n/g, '\n')           // Convert \\n to \n (fallback)
                            .replace(/\\r/g, '\r');           // Convert \\r to \r (fallback)

                        // Validate SDP format - must start with "v=0"
                        if (!sdpString.startsWith('v=0')) {
                            console.error('❌ [useWebRTC] Invalid SDP format - first 100 chars:', sdpString.substring(0, 100));
                            throw new Error(`Invalid SDP format: doesn't start with v=0`);
                        }

                        // Normalize to CRLF (\r\n) - WebRTC standard
                        sdpString = sdpString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');

                        // Remove incompatible SDP attributes that cause "SessionDescription is NULL" on Android
                        // a=extmap-allow-mixed is not supported by react-native-webrtc on Android
                        sdpString = sdpString.replace(/a=extmap-allow-mixed\r\n/g, '');

                        // Remove any trailing whitespace/newlines
                        sdpString = sdpString.trim();

                        // Ensure SDP ends with CRLF (WebRTC standard)
                        if (!sdpString.endsWith('\r\n')) {
                            sdpString += '\r\n';
                        }

                        // Final validation - ensure SDP has proper structure
                        const sdpLines = sdpString.split('\r\n').filter(line => line.trim().length > 0);
                        if (sdpLines.length < 3) {
                            throw new Error(`Invalid SDP: too few lines (${sdpLines.length})`);
                        }

                        // Validate each line starts with expected SDP format
                        const firstLine = sdpLines[0];
                        if (!firstLine.startsWith('v=')) {
                            throw new Error(`Invalid SDP: first line doesn't start with 'v=': ${firstLine}`);
                        }

                        // Sanitize offer to ensure it has only type and sdp
                        const cleanOffer = {
                            type: offerType as RTCSdpType,
                            sdp: sdpString
                        };
                        
                        console.log('📝 [useWebRTC] Sanitized offer:', {
                            type: cleanOffer.type,
                            sdpLength: cleanOffer.sdp.length,
                            sdpPreview: cleanOffer.sdp.substring(0, 50) + '...',
                            sdpLineCount: sdpLines.length,
                            signalingState: pc.signalingState,
                            hasTracks: pc.getSenders().length > 0,
                        });

                        // Log first few lines of SDP for debugging
                        console.log('📝 [useWebRTC] SDP first 5 lines:', sdpLines.slice(0, 5).join('\\r\\n'));
                        console.log('📝 [useWebRTC] SDP line ending type:', cleanOffer.sdp.includes('\r\n') ? 'CRLF (\\r\\n)' : 'LF (\\n)');
                        console.log('📝 [useWebRTC] Removed incompatible attributes (a=extmap-allow-mixed)');
                        
                        // Check for any unusual characters
                        const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(cleanOffer.sdp);
                        if (hasControlChars) {
                            console.warn('⚠️ [useWebRTC] SDP contains control characters!');
                        }

                        // Ensure peer connection is in stable state and has no local description
                        // For receiving an offer, we must be in 'stable' state with no local description
                        if (pc.signalingState !== 'stable') {
                            console.warn(`⚠️ [useWebRTC] Unexpected signaling state: ${pc.signalingState}, resetting...`);
                            pc.close();
                            const newPc = createPeerConnection();
                            if (newPc) {
                                pc = newPc;
                                if (localStream) {
                                    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                                }
                            } else {
                                throw new Error('Failed to recreate peer connection');
                            }
                        }

                        // Ensure no local description is set (we're receiving an offer, not creating one)
                        if (pc.localDescription) {
                            console.warn('⚠️ [useWebRTC] Local description already set, clearing it...');
                            // Can't directly clear, need to recreate PC
                            pc.close();
                            const newPc = createPeerConnection();
                            if (newPc) {
                                pc = newPc;
                                if (localStream) {
                                    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                                }
                            } else {
                                throw new Error('Failed to recreate peer connection');
                            }
                        }

                        // Try multiple approaches for react-native-webrtc compatibility
                        let success = false;
                        let lastError: any = null;

                        // Approach 0: Deep clone to ensure clean object for React Native bridge
                        try {
                            console.log('📝 [useWebRTC] Attempt 0: setRemoteDescription with deep-cloned offer...');
                            console.log('📝 [useWebRTC] PC state before setRemoteDescription:', {
                                signalingState: pc.signalingState,
                                connectionState: pc.connectionState,
                                iceConnectionState: pc.iceConnectionState,
                                sendersCount: pc.getSenders().length,
                                receiversCount: pc.getReceivers().length,
                            });
                            
                            // Deep clone to remove any prototype chains or non-serializable properties
                            const clonedOffer = JSON.parse(JSON.stringify(cleanOffer));
                            console.log('📝 [useWebRTC] Cloned offer:', {
                                type: clonedOffer.type,
                                sdpLength: clonedOffer.sdp?.length || 0,
                                sdpStartsWith: clonedOffer.sdp?.substring(0, 10) || 'null',
                            });
                            
                            await pc.setRemoteDescription(clonedOffer);
                            success = true;
                            console.log('✅ [useWebRTC] Attempt 0 succeeded (deep-cloned offer)');
                        } catch (e0: any) {
                            lastError = e0;
                            console.warn('⚠️ [useWebRTC] Attempt 0 failed:', e0?.message || e0);
                        }

                        // Approach 1: Direct plain object (react-native-webrtc sometimes prefers this)
                        if (!success) {
                            try {
                                console.log('📝 [useWebRTC] Attempt 1: setRemoteDescription with plain object...');
                                
                                // Ensure SDP is clean and valid
                                const finalSdp = cleanOffer.sdp.replace(/\0/g, ''); // Remove null bytes
                                
                                // Use plain object directly with validated SDP
                                const plainOffer = {
                                    type: cleanOffer.type,
                                    sdp: finalSdp,
                                };
                                
                                console.log('📝 [useWebRTC] Plain offer object:', {
                                    type: plainOffer.type,
                                    sdpLength: plainOffer.sdp.length,
                                    sdpFirstChars: plainOffer.sdp.substring(0, 30),
                                    sdpLineEnding: plainOffer.sdp.includes('\r\n') ? 'CRLF (\\r\\n)' : (plainOffer.sdp.includes('\n') ? 'LF (\\n)' : 'None'),
                                    hasExtmapAllowMixed: plainOffer.sdp.includes('extmap-allow-mixed'),
                                });
                                
                                await pc.setRemoteDescription(plainOffer);
                                success = true;
                                console.log('✅ [useWebRTC] Attempt 1 succeeded');
                            } catch (e1: any) {
                                lastError = e1;
                                console.warn('⚠️ [useWebRTC] Attempt 1 failed:', e1?.message || e1);
                                console.warn('⚠️ [useWebRTC] Error details:', {
                                    code: e1?.code,
                                    name: e1?.name,
                                });
                            }
                        }

                        // Approach 2: RTCSessionDescription constructor
                        if (!success) {
                            try {
                                console.log('📝 [useWebRTC] Attempt 2: setRemoteDescription with RTCSessionDescription...');
                                
                                // Ensure SDP is clean
                                const finalSdp = cleanOffer.sdp.replace(/\0/g, ''); // Remove null bytes
                                
                                const desc = new RTCSessionDescription({
                                    type: cleanOffer.type,
                                    sdp: finalSdp,
                                });
                                
                                console.log('📝 [useWebRTC] Created RTCSessionDescription:', {
                                    type: desc.type,
                                    sdpLength: desc.sdp?.length || 0,
                                    sdpFirstLine: desc.sdp?.substring(0, 20) || 'no sdp',
                                    sdpLineEnding: desc.sdp?.includes('\r\n') ? 'CRLF (\\r\\n)' : (desc.sdp?.includes('\n') ? 'LF (\\n)' : 'None'),
                                });
                                
                                // Verify the description object
                                if (!desc || !desc.type || !desc.sdp) {
                                    throw new Error(`Invalid RTCSessionDescription: type=${desc?.type}, sdp=${!!desc?.sdp}`);
                                }
                                
                                // Verify SDP format
                                if (!desc.sdp.startsWith('v=0')) {
                                    throw new Error(`Invalid SDP in RTCSessionDescription: doesn't start with v=0`);
                                }
                                
                                await pc.setRemoteDescription(desc);
                                success = true;
                                console.log('✅ [useWebRTC] Attempt 2 succeeded');
                            } catch (e2: any) {
                                lastError = e2;
                                console.warn('⚠️ [useWebRTC] Attempt 2 failed:', e2?.message || e2);
                            }
                        }

                        // Approach 3: Create fresh description with explicit properties and ensure type is exactly 'offer'
                        if (!success) {
                            try {
                                console.log('📝 [useWebRTC] Attempt 3: Creating description inline with explicit type...');
                                
                                // Ensure SDP is clean
                                const finalSdp = cleanOffer.sdp.replace(/\0/g, ''); // Remove null bytes
                                
                                const explicitOffer = {
                                    type: 'offer' as RTCSdpType,
                                    sdp: finalSdp,
                                };
                                
                                console.log('📝 [useWebRTC] Explicit offer:', {
                                    type: explicitOffer.type,
                                    sdpLength: explicitOffer.sdp.length,
                                    sdpStartsWithV0: explicitOffer.sdp.startsWith('v=0'),
                                });
                                
                                await pc.setRemoteDescription(explicitOffer);
                                success = true;
                                console.log('✅ [useWebRTC] Attempt 3 succeeded');
                            } catch (e3: any) {
                                lastError = e3;
                                console.warn('⚠️ [useWebRTC] Attempt 3 failed:', e3?.message || e3);
                            }
                        }

                        if (!success) {
                            console.error('❌ [useWebRTC] All attempts failed. Last error:', lastError);
                            console.error('❌ [useWebRTC] Offer that failed:', JSON.stringify(cleanOffer, null, 2));
                            throw new Error(`All setRemoteDescription attempts failed: ${lastError?.message || 'Unknown error'}`);
                        }

                        console.log('✅ [useWebRTC] Remote description set successfully');

                        // Process any queued ICE candidates now that remote description is set
                        if (pendingIceCandidates.current.length > 0) {
                            console.log(`📥 [useWebRTC] Processing ${pendingIceCandidates.current.length} queued ICE candidates after setting remote description`);
                            const queued = [...pendingIceCandidates.current];
                            pendingIceCandidates.current = [];
                            
                            for (const queuedCandidate of queued) {
                                try {
                                    await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                                    console.log('✅ [useWebRTC] Queued ICE candidate added successfully');
                                } catch (err: any) {
                                    console.warn('⚠️ [useWebRTC] Failed to add queued ICE candidate:', err?.message || err);
                                }
                            }
                        }

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        // Safe serialization for answer
                        // @ts-ignore
                        const answerInit = (typeof answer.toJSON === 'function') ? answer.toJSON() : answer;

                        if (remoteUserId.current) {
                            await SignalingService.sendAnswer(answerInit, remoteUserId.current);
                        }
                    } catch (sdError: any) {
                        console.error('❌ [useWebRTC] Error setting remote description:', sdError);
                        throw sdError;
                    }
                } catch (err) {
                    console.error('Error handling offer:', err);
                    setError('Failed to handle incoming call');
                }
            },

            onAnswer: async (answer, from) => {
                try {
                    console.log('📝 [useWebRTC] onAnswer received from:', from, 'with answer:', JSON.stringify(answer));
                    
                    const pc = peerConnection.current;
                    if (!pc) {
                        console.error('❌ [useWebRTC] No peer connection available for answer');
                        return;
                    }

                    // Store remote user ID
                    if (from) {
                        remoteUserId.current = from;
                    }

                    // Ensure answer is an object with type and sdp
                    if (!answer || typeof answer !== 'object') {
                        throw new Error('Invalid answer format: answer is not an object');
                    }

                    // Extract type and sdp, handling nested structures
                    const answerType = answer.type || (answer as any).type;
                    let answerSdp = answer.sdp || (answer as any).sdp || '';

                    if (!answerType || !answerSdp) {
                        console.error('❌ [useWebRTC] Invalid answer structure:', {
                            hasType: !!answerType,
                            hasSdp: !!answerSdp,
                            answerKeys: Object.keys(answer),
                        });
                        throw new Error(`Invalid answer: missing type (${!!answerType}) or sdp (${!!answerSdp})`);
                    }

                    // Ensure SDP is a string
                    let sdpString = String(answerSdp);
                    
                    // If SDP is a JSON stringified object, parse it first
                    if (sdpString.startsWith('{') || sdpString.startsWith('"')) {
                        try {
                            const parsed = JSON.parse(sdpString);
                            if (parsed.sdp) {
                                sdpString = parsed.sdp;
                            } else if (typeof parsed === 'string') {
                                sdpString = parsed;
                            }
                        } catch (e) {
                            // Not JSON, continue with original string
                        }
                    }

                    // Trim whitespace
                    sdpString = sdpString.trim();
                    
                    if (!sdpString || sdpString.length < 10) {
                        throw new Error(`Invalid SDP: too short (${sdpString.length} chars)`);
                    }

                    // Convert escaped newlines to actual newlines for react-native-webrtc
                    // Handle multiple levels of escaping: \\\\r\\\\n -> \\r\\n -> \r\n
                    sdpString = sdpString
                        .replace(/\\\\r\\\\n/g, '\r\n')  // Convert \\\\r\\\\n to \r\n (double-escaped)
                        .replace(/\\r\\n/g, '\r\n')       // Convert \\r\\n to \r\n (JSON escaped)
                        .replace(/\\n/g, '\n')             // Convert \\n to \n (fallback)
                        .replace(/\\r/g, '\r');           // Convert \\r to \r (fallback)

                    // Validate SDP format - must start with "v=0"
                    if (!sdpString.startsWith('v=0')) {
                        console.error('❌ [useWebRTC] Invalid SDP format - first 100 chars:', sdpString.substring(0, 100));
                        throw new Error(`Invalid SDP format: doesn't start with v=0`);
                    }

                    // Normalize to CRLF (\r\n) - WebRTC standard
                    sdpString = sdpString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');

                    // Remove incompatible SDP attributes that cause "SessionDescription is NULL" on Android
                    // a=extmap-allow-mixed is not supported by react-native-webrtc on Android
                    sdpString = sdpString.replace(/a=extmap-allow-mixed\r\n/g, '');

                    // Remove any trailing whitespace/newlines
                    sdpString = sdpString.trim();

                    // Ensure SDP ends with CRLF (WebRTC standard)
                    if (!sdpString.endsWith('\r\n')) {
                        sdpString += '\r\n';
                    }

                    // Final validation - ensure SDP has proper structure
                    const sdpLines = sdpString.split('\r\n').filter(line => line.trim().length > 0);
                    if (sdpLines.length < 3) {
                        throw new Error(`Invalid SDP: too few lines (${sdpLines.length})`);
                    }

                    // Validate each line starts with expected SDP format
                    const firstLine = sdpLines[0];
                    if (!firstLine.startsWith('v=')) {
                        throw new Error(`Invalid SDP: first line doesn't start with 'v=': ${firstLine}`);
                    }

                    // Sanitize answer to ensure it has only type and sdp
                    const cleanAnswer = {
                        type: answerType as RTCSdpType,
                        sdp: sdpString
                    };
                    
                    console.log('📝 [useWebRTC] Sanitized answer:', {
                        type: cleanAnswer.type,
                        sdpLength: cleanAnswer.sdp.length,
                        sdpPreview: cleanAnswer.sdp.substring(0, 50) + '...',
                        sdpLineCount: sdpLines.length,
                        signalingState: pc.signalingState,
                    });

                    // Try multiple approaches for react-native-webrtc compatibility
                    let success = false;
                    let lastError: any = null;

                    // Approach 0: Create a completely fresh plain object
                    try {
                        console.log('📝 [useWebRTC] Attempt 0: setRemoteDescription (answer) with fresh plain object...');
                        const freshAnswer: RTCSessionDescriptionInit = {
                            type: 'answer' as RTCSdpType,
                            sdp: cleanAnswer.sdp,
                        };
                        await pc.setRemoteDescription(freshAnswer);
                        success = true;
                        console.log('✅ [useWebRTC] Attempt 0 succeeded (answer)');
                    } catch (e0: any) {
                        lastError = e0;
                        console.warn('⚠️ [useWebRTC] Attempt 0 failed (answer):', e0?.message || e0);
                    }

                    // Approach 1: RTCSessionDescription constructor
                    if (!success) {
                        try {
                            console.log('📝 [useWebRTC] Attempt 1: setRemoteDescription (answer) with RTCSessionDescription...');
                            const desc = new RTCSessionDescription({
                                type: cleanAnswer.type,
                                sdp: cleanAnswer.sdp,
                            });
                            await pc.setRemoteDescription(desc);
                            success = true;
                            console.log('✅ [useWebRTC] Attempt 1 succeeded (answer)');
                        } catch (e1: any) {
                            lastError = e1;
                            console.warn('⚠️ [useWebRTC] Attempt 1 failed (answer):', e1?.message || e1);
                        }
                    }

                    if (!success) {
                        console.error('❌ [useWebRTC] All attempts failed for answer. Last error:', lastError);
                        throw new Error(`All setRemoteDescription attempts failed for answer: ${lastError?.message || 'Unknown error'}`);
                    }

                    console.log('✅ [useWebRTC] Remote description (answer) set successfully');

                    // Process any queued ICE candidates now that remote description is set
                    if (pendingIceCandidates.current.length > 0) {
                        console.log(`📥 [useWebRTC] Processing ${pendingIceCandidates.current.length} queued ICE candidates after setting remote description (answer)`);
                        const queued = [...pendingIceCandidates.current];
                        pendingIceCandidates.current = [];
                        
                        for (const queuedCandidate of queued) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                                console.log('✅ [useWebRTC] Queued ICE candidate added successfully');
                            } catch (err: any) {
                                console.warn('⚠️ [useWebRTC] Failed to add queued ICE candidate:', err?.message || err);
                            }
                        }
                    }
                } catch (err) {
                    console.error('❌ [useWebRTC] Error handling answer:', err);
                    setError('Failed to establish connection');
                }
            },

            onIceCandidate: async (candidate, from) => {
                try {
                    const pc = peerConnection.current;
                    if (!pc) {
                        console.warn('⚠️ [useWebRTC] No peer connection available for ICE candidate');
                        return;
                    }

                    // Store remote user ID
                    if (from) {
                        remoteUserId.current = from;
                    }

                    // If remote description is not set yet, queue the candidate
                    if (!pc.remoteDescription) {
                        console.log('📥 [useWebRTC] Remote description not set yet, queueing ICE candidate');
                        pendingIceCandidates.current.push(candidate);
                        return;
                    }

                    // Remote description is set, add the candidate
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('✅ [useWebRTC] ICE candidate added successfully');

                    // Process any queued candidates
                    if (pendingIceCandidates.current.length > 0) {
                        console.log(`📥 [useWebRTC] Processing ${pendingIceCandidates.current.length} queued ICE candidates`);
                        const queued = [...pendingIceCandidates.current];
                        pendingIceCandidates.current = [];
                        
                        for (const queuedCandidate of queued) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                                console.log('✅ [useWebRTC] Queued ICE candidate added successfully');
                            } catch (err: any) {
                                console.warn('⚠️ [useWebRTC] Failed to add queued ICE candidate:', err?.message || err);
                            }
                        }
                    }
                } catch (err: any) {
                    // If error is "remote description was null", queue it
                    if (err?.message?.includes('remote description was null') || err?.message?.includes('remote description is null')) {
                        console.log('📥 [useWebRTC] Remote description not set, queueing ICE candidate');
                        pendingIceCandidates.current.push(candidate);
                    } else {
                        console.error('❌ [useWebRTC] Error adding ICE candidate:', err);
                    }
                }
            },

            onUserJoined: async (userId) => {
                console.log('📞 [useWebRTC] User joined:', userId);
                remoteUserId.current = userId;

                // If we have a pending offer, send it now
                if (pendingOffer.current) {
                    const offer = pendingOffer.current;
                    pendingOffer.current = null; // Clear BEFORE async to prevent race condition
                    console.log('📤 [useWebRTC] Sending pending offer to:', userId);
                    await SignalingService.sendOffer(offer, userId);
                } else {
                    // If we have a local description (offer), send it to the remote user
                    const pc = peerConnection.current;
                    if (pc && pc.localDescription && pc.localDescription.type === 'offer') {
                        console.log('📤 [useWebRTC] Sending existing offer to:', userId);
                        // @ts-ignore
                        const desc = pc.localDescription;
                        // @ts-ignore
                        const offerInit = (typeof desc.toJSON === 'function') ? desc.toJSON() : desc;
                        await SignalingService.sendOffer(offerInit, userId);
                    }
                }
            },

            onUserLeft: () => {
                console.log('User left');
                endCall();
            },

            onCallEnded: (endedBy) => {
                console.log('Call ended by:', endedBy);
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
            console.log('🔧 [useWebRTC] Initializing WebRTC...', { userId, roomId });

            // Connect to signaling server
            console.log('🔧 [useWebRTC] Connecting to signaling service...');
            await SignalingService.connect(userId, setupSignalingCallbacks());
            console.log('✅ [useWebRTC] Signaling service connected');

            // Get local media stream
            console.log('🎤 [useWebRTC] Requesting media stream...');
            const stream = await getUserMedia();
            console.log('🎤 [useWebRTC] getUserMedia result:', stream ? 'Success' : 'Failed');

            if (stream) {
                setLocalStream(stream);
                setIsReady(true); // Mark as ready after successful initialization
                console.log('✅ [useWebRTC] WebRTC initialized successfully, isReady set to TRUE');
            } else {
                console.error('❌ [useWebRTC] No stream returned from getUserMedia');
                setError('Failed to get media stream');
            }
        } catch (err) {
            console.error('❌ [useWebRTC] Initialization error:', err);
            console.error('❌ [useWebRTC] Error details:', JSON.stringify(err));
            setError('Failed to initialize call');
        }
    };

    /**
     * Start a new call (create offer)
     */
    const startCall = async () => {
        try {
            console.log('🚀 [useWebRTC] startCall invoked');
            // Wait for initialization if not ready
            if (!isReady || !localStream) {
                console.log('⏳ [useWebRTC] Waiting for initialization...');
                setIsConnecting(true);
                return;
            }

            console.log('📞 [useWebRTC] Starting call...', {
                roomId,
                userId,
                isVideoEnabled,
            });
            setIsConnecting(true);
            setError(null);

            // Join the room first
            console.log('📡 [useWebRTC] Joining Pusher room:', roomId);
            SignalingService.joinRoom(roomId);

            // Create peer connection
            console.log('🛠 [useWebRTC] Creating PeerConnection...');
            const pc = createPeerConnection();
            if (!pc) {
                throw new Error('Failed to create peer connection');
            }
            console.log('✅ [useWebRTC] PeerConnection created:', pc);

            // Add local stream to peer connection
            console.log('🎥 [useWebRTC] Adding local stream tracks:', localStream);
            const tracks = localStream.getTracks();
            console.log('🎥 [useWebRTC] Tracks found:', tracks.length);

            tracks.forEach(track => {
                try {
                    console.log('🎥 [useWebRTC] Adding track:', track.kind, track.id);
                    pc.addTrack(track, localStream);
                } catch (trackError) {
                    console.error('❌ [useWebRTC] Error adding track:', trackError);
                }
            });

            // Create offer
            console.log('🤝 [useWebRTC] Creating offer...');
            const offerOptions = {
                offerToReceiveAudio: true,
                offerToReceiveVideo: isVideoEnabled,
            };
            console.log('🤝 [useWebRTC] Offer options:', offerOptions);

            const offer = await pc.createOffer(offerOptions);
            console.log('✅ [useWebRTC] Offer created:', offer);

            console.log('📝 [useWebRTC] Setting local description...');
            await pc.setLocalDescription(offer);
            console.log('✅ [useWebRTC] Local description set');

            // Store offer to send when remote user joins
            // @ts-ignore
            const offerInit = (typeof offer.toJSON === 'function') ? offer.toJSON() : offer;
            pendingOffer.current = offerInit;
            console.log('📤 [useWebRTC] Offer created, waiting for remote user to join...');

            // Notify backend that call has started (this will trigger webrtc-call-started event)
            try {
                const { startWebRTCCall } = await import('../services/api/webrtcService');
                const consultationID = parseInt(roomId.replace(/[^\d]/g, '') || roomId);
                if (consultationID) {
                    await startWebRTCCall(consultationID, userId, isVideoEnabled ? 'video' : 'audio');
                    console.log('✅ [useWebRTC] Call started notification sent to backend');
                }
            } catch (apiError) {
                console.warn('⚠️ [useWebRTC] Failed to notify backend of call start:', apiError);
                // Continue anyway - the offer will be sent when remote user joins
            }

            // If remote user already joined AND we still have the pending offer, send it
            // (Check pendingOffer to avoid duplicate sends if onUserJoined already sent it)
            if (remoteUserId.current && pendingOffer.current) {
                console.log('📤 [useWebRTC] Remote user already joined, sending offer immediately');
                await SignalingService.sendOffer(offerInit, remoteUserId.current);
                pendingOffer.current = null;
            } else if (remoteUserId.current) {
                console.log('ℹ️ [useWebRTC] Remote user joined but offer already sent');
            }

            console.log('✅ [useWebRTC] Call started successfully');
        } catch (err) {
            console.error('❌ [useWebRTC] Error starting call:', err);
            // console.error('❌ [useWebRTC] Error stack:', err.stack); // Stack is often undefined in RN errors logged like this
            setError('Failed to start call');
            setIsConnecting(false);
            pendingOffer.current = null;
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
        pendingOffer.current = null;
        pendingIceCandidates.current = [];
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
