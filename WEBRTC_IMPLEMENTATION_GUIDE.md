# WebRTC Video/Audio Consultation Implementation Guide

This guide provides step-by-step instructions for implementing and integrating the WebRTC-based video and audio consultation feature in your Telehealth mobile app.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Backend Integration](#backend-integration)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

The WebRTC implementation consists of three main components:

1. **Signaling Server** - Node.js/Express/Socket.IO server for WebRTC signaling
2. **Mobile App** - React Native app with WebRTC support
3. **WebRTC Service** - Custom hook and service for managing peer connections

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Patient App    │◄───────►│  Signaling       │◄───────►│  Doctor App     │
│  (React Native) │  WSS    │  Server          │  WSS    │  (React Native) │
│                 │         │  (Socket.IO)     │         │                 │
└────────┬────────┘         └──────────────────┘         └────────┬────────┘
         │                                                         │
         │                WebRTC P2P Connection                    │
         │                (Audio/Video Streams)                    │
         └─────────────────────────────────────────────────────────┘
```

## Setup

### 1. Install Dependencies (Mobile App)

The required dependencies are already installed:
- `react-native-webrtc` - WebRTC implementation for React Native
- `socket.io-client` - Socket.IO client for signaling

### 2. Configure Android Permissions

Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 3. Configure iOS Permissions

Add the following to `ios/YourApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera for video consultations</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for audio/video consultations</string>
```

### 4. Link Native Dependencies

For iOS:
```bash
cd ios && pod install && cd ..
```

For Android:
The dependencies should auto-link. If issues occur:
```bash
npx react-native link react-native-webrtc
```

## Backend Integration

### Option 1: Standalone Signaling Server (Recommended for Development)

1. Navigate to the signaling server directory:
```bash
cd backend-signaling
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://YOUR_LOCAL_IP:8081
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Option 2: Integrate with Existing Backend

If you want to integrate the signaling server with your existing Express backend:

1. Install dependencies in your existing backend:
```bash
npm install socket.io express dotenv cors
```

2. Update your main server file (e.g., `server.js`):

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Your existing middleware and routes
app.use(express.json());
app.use('/api', yourApiRoutes);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

// Copy the Socket.IO handlers from backend-signaling/src/index.js
// ... (room management, offer/answer, ICE candidates, etc.)

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

3. Copy the event handlers from `backend-signaling/src/index.js` into your server file.

### Adding Authentication to Signaling

For production, add JWT authentication:

```javascript
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

## Frontend Integration

### 1. Update API Endpoints

Update `SignalingService.ts` with your server URL:

```typescript
// In src/services/webrtc/SignalingService.ts
constructor(serverUrl: string = 'http://YOUR_SERVER_IP:3001') {
  this.serverUrl = serverUrl;
}
```

Or pass it dynamically:

```typescript
// In VideoCallScreen.tsx or AudioCallScreen.tsx
const { ... } = useWebRTC({
  userId: actualUserId, // Replace with actual user ID from auth
  roomId: consultationId,
  signalingServerUrl: 'http://YOUR_SERVER_IP:3001',
});
```

### 2. Add Navigation Routes

Update your navigation stack to include the new screens:

```typescript
// In your navigation file (e.g., src/navigation/AppNavigator.tsx)
import VideoCallScreen from '../screens/VideoCall/VideoCallScreen';
import AudioCallScreen from '../screens/VideoCall/AudioCallScreen';

// Add to your stack navigator
<Stack.Screen 
  name="VideoCall" 
  component={VideoCallScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="AudioCall" 
  component={AudioCallScreen}
  options={{ headerShown: false }}
/>
```

### 3. Update Consultation Payment Screen

Modify the consultation payment or confirmation screen to navigate to video/audio call screens:

```typescript
// Example: After payment success, start consultation
const handleStartConsultation = async () => {
  try {
    // Create consultation in backend and get consultationId
    const response = await apiClient.post(API.CONSULTATIONS.BOOK_CONSULTATION, {
      // ... consultation details
    });

    const consultationId = response.data.consultationId;
    
    // Navigate to appropriate call screen
    if (consultationType === 'video') {
      navigation.navigate('VideoCall', {
        consultationId,
        doctorName: 'Dr. Smith',
        isInitiator: true, // Patient initiates
        clinicId,
      });
    } else if (consultationType === 'audio' || consultationType === 'voice') {
      navigation.navigate('AudioCall', {
        consultationId,
        doctorName: 'Dr. Smith',
        isInitiator: true,
        clinicId,
      });
    }
  } catch (error) {
    console.error('Error starting consultation:', error);
  }
};
```

### 4. Backend API Integration

Add a new endpoint to your existing backend to create consultations:

```javascript
// POST /api/consultations/create
router.post('/create', authenticate, async (req, res) => {
  try {
    const { serviceId, consultationType, doctorId } = req.body;
    const patientId = req.user.id;

    // Create consultation record
    const consultation = await Consultation.create({
      id: generateConsultationId(), // e.g., "consultation_123"
      patientId,
      doctorId,
      serviceId,
      type: consultationType,
      status: 'pending',
      createdAt: new Date(),
    });

    res.json({
      success: true,
      consultationId: consultation.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

### 5. Update ConsultDoctorBottomSheet

The existing `ConsultDoctorBottomSheet` already navigates to `ConsultationPayment`. Update the payment success flow to navigate to call screens as shown above.

## Testing

### Local Testing Setup

1. **Start the Signaling Server:**
```bash
cd backend-signaling
npm run dev
```

2. **Get Your Local IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

3. **Update Configuration:**

Update `SignalingService.ts`:
```typescript
constructor(serverUrl: string = 'http://YOUR_LOCAL_IP:3001') {
```

4. **Run the App:**
```bash
# Terminal 1
npm start

# Terminal 2
npm run android
# or
npm run ios
```

### Testing Flow

1. **Book a consultation** from the Clinic Detail screen
2. **Complete payment** (or skip if in test mode)
3. **App should navigate** to VideoCallScreen or AudioCallScreen
4. **Check signaling server logs** to verify connection
5. **Test with two devices** or emulators for full P2P testing

### Testing with Two Devices

For proper testing, you need two devices (or one device + one emulator):

1. **Device 1 (Patient):**
   - Join consultation room with `isInitiator: true`

2. **Device 2 (Doctor - Separate App Build):**
   - Join same room with `isInitiator: false`
   - Use same `consultationId`

3. **Both devices should:**
   - Connect to signaling server
   - Exchange offers/answers
   - Establish P2P connection
   - Stream audio/video

## Production Deployment

### 1. Deploy Signaling Server

**Option A: Heroku**
```bash
cd backend-signaling
heroku create your-app-name
git push heroku main
```

**Option B: AWS/DigitalOcean/VPS**
- Use PM2 for process management
- Setup Nginx reverse proxy
- Configure SSL/TLS (Let's Encrypt)

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start src/index.js --name webrtc-signaling

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

### 2. Configure TURN Server

For production, you MUST use TURN servers for NAT traversal:

**Option A: Use Free TURN Server (Limited)**
```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};
```

**Option B: Deploy Your Own TURN Server (Recommended)**

Use [coturn](https://github.com/coturn/coturn):
```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=username:password
realm=yourdomain.com
```

Update ICE_SERVERS in `useWebRTC.ts`:
```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.yourdomain.com:3478' },
    {
      urls: 'turn:turn.yourdomain.com:3478',
      username: 'username',
      credential: 'password',
    },
  ],
};
```

### 3. Update Mobile App for Production

```typescript
// Use environment variables
const SIGNALING_SERVER_URL = __DEV__ 
  ? 'http://192.168.1.100:3001'
  : 'wss://your-signaling-server.com';
```

### 4. Security Checklist

- [ ] Enable HTTPS/WSS (SSL/TLS)
- [ ] Implement JWT authentication for Socket.IO
- [ ] Add rate limiting
- [ ] Validate room permissions
- [ ] Implement session timeouts
- [ ] Add logging and monitoring
- [ ] Configure proper CORS
- [ ] Use secure TURN credentials
- [ ] Encrypt signaling messages (optional)

## Troubleshooting

### Issue: Can't Connect to Signaling Server

**Solution:**
1. Check if server is running: `curl http://localhost:3001/health`
2. Verify firewall allows port 3001
3. Check CORS configuration
4. Ensure correct IP address in mobile app

### Issue: Video/Audio Not Showing

**Solution:**
1. Check camera/microphone permissions
2. Verify stream is being created: `console.log(localStream)`
3. Check RTCView component props
4. Ensure peer connection state is 'connected'

### Issue: Connection Fails After Initial Success

**Solution:**
1. Implement TURN server (not just STUN)
2. Check NAT/Firewall settings
3. Enable ICE restart on connection failure
4. Implement reconnection logic

### Issue: Poor Video Quality

**Solution:**
1. Adjust video constraints in `getUserMedia()`
2. Implement adaptive bitrate
3. Monitor network quality
4. Reduce frame rate or resolution for poor connections

### Issue: Works on WiFi but Not on Cellular

**Solution:**
1. This indicates TURN server is needed
2. Some cellular networks block P2P connections
3. Ensure TURN server is properly configured
4. Test with different cellular networks

## Next Steps

1. **Implement Call History:**
   - Store consultation records in database
   - Add call duration tracking
   - Save call recordings (with consent)

2. **Add Features:**
   - Screen sharing
   - File sharing during call
   - Chat during call
   - Virtual background
   - Noise cancellation

3. **Improve UX:**
   - Add connection quality indicator
   - Implement reconnection UI
   - Add call notifications
   - Support call waiting/transfer

4. **Monitoring:**
   - Track call quality metrics
   - Monitor signaling server health
   - Log connection failures
   - Alert on high failure rates

## Additional Resources

- [WebRTC Official Documentation](https://webrtc.org/)
- [react-native-webrtc GitHub](https://github.com/react-native-webrtc/react-native-webrtc)
- [Socket.IO Documentation](https://socket.io/docs/)
- [STUN/TURN Server List](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review WebRTC browser/native logs
3. Check signaling server logs
4. Review Socket.IO connection status

---

**Created:** December 28, 2025
**Last Updated:** December 28, 2025
