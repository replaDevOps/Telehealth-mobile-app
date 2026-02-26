import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Keyboard, Platform, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { styles } from './style';
import { patient, RecommandImage } from '@assets/images';
import ClinicAvatar from '@components/common/ClinicAvatar';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import ConfirmationModal from '@components/molecules/ConfirmationModal';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  ChatHeader,
  MessageInput,
  MessageList,
} from '../../../components/chat';
import {
  DEFAULT_DOCTOR_INFO,
  DEFAULT_CLINIC_INFO,
  CONSULTATION_DURATION,
  getCurrentTimestamp,
  getInitialMessages,
} from '../../../constants/appData';
import { Message, Service } from '../../../types/chat.types';
import { useCart } from '@context/CartContext';
import { useTranslation } from 'react-i18next';
import ConsultDoctorBottomSheet from '@components/molecules/ConsultDoctorBottomSheet';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';
import { useProfileStore } from '@store';
import { pusherService } from '@services/pusher/PusherService';
import { endConsultation } from '@services/api/webrtcService';
import { useBackgroundTimer } from '../../../hooks/useBackgroundTimer';

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  const { t } = useTranslation();
  // Extract route params with defaults
  const chatType = route?.params?.chatType || 'ai';
  const fromHistory = route?.params?.fromHistory || false;
  const doctorInfo = route?.params?.doctorInfo || DEFAULT_DOCTOR_INFO;
  const [clinicInfoState, setClinicInfoState] = useState<any>(route?.params?.clinicInfo || DEFAULT_CLINIC_INFO);
  // Get consultationID from route params - check both consultationID and id
  const consultationID = route?.params?.consultationID || route?.params?.id;
  const recipientID = route?.params?.recipientID;
  
  // Log consultationID on mount for debugging
  useEffect(() => {
    console.log('📞 [ChatScreen] Route params - consultationID:', route?.params?.consultationID, 'id:', route?.params?.id, 'final consultationID:', consultationID);
  }, []);
  const { addToCart } = useCart();

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor' && !fromHistory,
  );

  // Track consultation start time
  useEffect(() => {
    if (isConsultationActive && chatType === 'doctor' && consultationID && !consultationStartTimeRef.current) {
      consultationStartTimeRef.current = Date.now();
      console.log('📞 [ChatScreen] Consultation started, tracking duration');
    }
  }, [isConsultationActive, chatType, consultationID]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [consultationData, setConsultationData] = useState<any>(null);
  const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
  const [flexToggle, setFlexToggle] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState<string | null>(null);
  const [consultationEndedState, setConsultationEndedState] = useState<boolean>(false);
  const consultationStartTimeRef = useRef<number | null>(null); // Track when consultation started
  const consultationEndedRef = useRef(false); // Prevent duplicate API calls
  const checkPrescriptionAndShowModalRef = useRef<(() => void) | undefined>(undefined); // Ref for background timer callback

  const scrollRef = useRef<ScrollView>(null);
  const auth = useAuthStore(state => state.auth);
  const { profileData } = useProfileStore();
  const patientID = auth?.id;
  // Get profile image from store
  const patientProfileImage = profileData?.image;
  const patientProfileAvatar = patientProfileImage
    ? (patientProfileImage.startsWith('http')
      ? { uri: patientProfileImage }
      : { uri: `https://telehealth.repla-projects.com/${patientProfileImage}` })
    : patient;

  useEffect(() => {
    console.log('clinicInfo.image type:', typeof (clinicInfoState));
    console.log('clinicInfo.image value:', clinicInfoState?.image);
  }, [clinicInfoState]);

  // ---------- Memoized Values ----------
  const initialMessages = useMemo(
    () => getInitialMessages(chatType, doctorInfo),
    [chatType, doctorInfo],
  );

  const showAvatar = chatType === 'doctor';
  const canSendMessages = !fromHistory;

  // Keyboard listeners for Android flex toggle fix
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setFlexToggle(false);
    });

    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setFlexToggle(true);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // ---------- Lifecycle ----------
  useEffect(() => {
    // If consultationID exists, fetch messages from API
    if (consultationID && chatType === 'doctor') {
      fetchConsultationMessages();
    } else if (chatType === 'doctor') {
      // For doctor chat without consultationID, start with empty messages
      setMessages([]);
    } else {
      // For AI chat, use initial messages
      setMessages(initialMessages);
    }
  }, [consultationID, chatType]);

  // Fetch consultation messages from API
  const fetchConsultationMessages = useCallback(async (silent: boolean = false) => {
    if (!consultationID) return;

    if (!silent) {
      setLoadingMessages(true);
    }
    try {
      // Use history API if fromHistory is true, otherwise use consultations API
      const endpoint = fromHistory
        ? `${API.HISTORY.GET_CONSULTATION_MESSAGES}/${consultationID}`
        : `${API.CONSULTATIONS.GET_CONSULTATION_MESSAGES}/${consultationID}`;

      const response = await apiClient.get(endpoint);

      console.log('Consultation messages response:', response.data);

      if (response.data?.success !== false) {
        // Response structure: { success: true, data: {...}, messages: [...] }
        // Messages are at the root level, not nested in data
        const apiMessages = Array.isArray(response.data.messages)
          ? response.data.messages
          : [];

        // Extract consultation data for doctor/patient info
        const consultationDataFromAPI = response.data?.data;
        const doctorData = consultationDataFromAPI?.doctor;
        const patientData = consultationDataFromAPI?.patient;

        // Store consultation data
        setConsultationData(consultationDataFromAPI);

        // Normalize clinic info from API and update clinic state for display
        const apiClinic = consultationDataFromAPI?.clinic || consultationDataFromAPI?.clinicInfo || consultationDataFromAPI;
        if (apiClinic && typeof apiClinic === 'object') {
          const normalizedApiClinic = {
            id: apiClinic.id || consultationDataFromAPI?.clinicID || null,
            name: apiClinic.clinicName || apiClinic.clinicName || consultationDataFromAPI?.clinicName || '',
            clinicName: apiClinic.clinicName || apiClinic.name || consultationDataFromAPI?.clinicName || '',
            location: apiClinic.location || apiClinic.details?.address || consultationDataFromAPI?.location || '',
            image: apiClinic.image || apiClinic.logo || apiClinic.coverImage || undefined,
          };
          setClinicInfoState(normalizedApiClinic);
          console.log('✅ [ChatScreen] Updated clinicInfoState from API:', normalizedApiClinic);
        }

        // Update doctorInfo if available from API
        if (doctorData && chatType === 'doctor') {
          // You could update doctorInfo here if needed
          console.log('Doctor data from API:', doctorData);
        }

        const mappedMessages: Message[] = apiMessages.map((msg: any) => {
          // Determine if message is from user (patient) or doctor
          // Use sender.type from API response (most reliable)
          const isUser = msg.sender?.type === 'patient' ||
            String(msg.senderID) === String(patientData?.id) ||
            String(msg.senderID) === String(patientID);

          // Get sender info from API response (sender object has name, image, type)
          const senderInfo = msg.sender;

          return {
            id: String(msg.id || msg.messageID || Date.now()),
            type: isUser ? 'user' : 'bot',
            text: msg.message || msg.text || msg.content || '',
            timestamp: msg.dateTime || msg.created_at || msg.timestamp || msg.createdAt || getCurrentTimestamp(),
            user: isUser
              ? {
                // Use sender info from API if available, otherwise fallback to patientData
                name: senderInfo?.name || patientData?.name || 'You',
                avatar: senderInfo?.image ? { uri: senderInfo.image } : (patientData?.image ? { uri: patientData.image } : patient)
              }
              : showAvatar && (senderInfo || doctorData)
                ? {
                  // Use sender info from API if available, otherwise fallback to doctorData
                  name: senderInfo?.name || doctorData?.name || doctorInfo.name,
                  avatar: senderInfo?.image ? { uri: senderInfo.image } : (doctorData?.image ? { uri: doctorData.image } : doctorInfo.avatar)
                }
                : showAvatar && doctorInfo
                  ? { name: doctorInfo.name, avatar: doctorInfo.avatar }
                  : undefined,
            images: (() => {
              const imagePath = msg.file || msg.image || msg.fileUrl;
              if (!imagePath) return undefined;

              // File is already a full URL from the API, use it directly
              // Only prepend BASE_URL if it's a relative path
              const fullImageUri = imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('file://')
                ? `https://telehealth.repla-projects.com/${imagePath}`
                : imagePath;

              return [{ uri: fullImageUri }];
            })(),
          };
        });

        // Only use API messages, no fallback to initial messages
        setMessages(mappedMessages);
      } else {
        // If no messages from API, show empty array
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching consultation messages:', error);
      // On error, show empty array instead of initial messages
      setMessages([]);
      if (!silent) {
        Toast.error(error?.message || 'Failed to load messages');
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }, [consultationID, recipientID, showAvatar, doctorInfo, chatType]);

  // Helper function to calculate consultation duration
  const calculateDuration = useCallback(() => {
    if (!consultationStartTimeRef.current) {
      return '0 min';
    }
    const durationMs = Date.now() - consultationStartTimeRef.current;
    const durationMinutes = Math.floor(durationMs / 60000);
    return `${durationMinutes} min`;
  }, []);

  // Helper function to end consultation and notify the other side
  const endConsultationAndNotify = useCallback(async () => {
    if (consultationEndedRef.current || !consultationID || !isConsultationActive) {
      return;
    }

    consultationEndedRef.current = true;
    const duration = calculateDuration();
    setConsultationDuration(duration);
    setConsultationEndedState(true);
    setIsConsultationActive(false);

    try {
      // In patient app: the user is always a patient, chatType='doctor' means chatting with doctor
      // So from = patient_XX, to = doctor_YY
      const doctorId = recipientID || consultationData?.doctorID || consultationData?.doctor?.id;
      const fromUserId = `patient_${patientID}`;
      const toUserId = `doctor_${doctorId}`;

      if (!patientID || !doctorId) {
        console.warn('⚠️ [ChatScreen] Missing user IDs, cannot notify other side:', { fromUserId, toUserId, patientID, doctorId, recipientID });
        return;
      }

      console.log('📞 [ChatScreen] Ending consultation and notifying other side:', {
        consultationID,
        duration,
        from: fromUserId,
        to: toUserId,
        chatType,
      });

      await endConsultation({
        consultationID: Number(consultationID),
        duration,
        from: fromUserId,
        to: toUserId,
        offer: { type: 'offer', sdp: '...' }, // Required by API
      });

      console.log('✅ [ChatScreen] Consultation ended successfully, other side notified');
    } catch (error: any) {
      console.error('❌ [ChatScreen] Error ending consultation:', error);
      // Still show modal even if API call fails
      Toast.error(error?.response?.data?.message || 'Failed to end consultation');
    }
  }, [consultationID, isConsultationActive, chatType, patientID, recipientID, consultationData, calculateDuration]);

  // Helper function to end consultation and show modal (without checking prescription upfront)
  const checkPrescriptionAndShowModal = useCallback(async () => {
    // End consultation and notify the other side first
    await endConsultationAndNotify();

    // Show modal immediately - prescription will be fetched on button click
    // Always show button, let user decide when to fetch
    setHasPrescription(true); // Always assume we should show the button
    setModalVisible(true);
  }, [endConsultationAndNotify]);

  // Keep ref updated for background timer callback
  useEffect(() => {
    checkPrescriptionAndShowModalRef.current = checkPrescriptionAndShowModal;
  }, [checkPrescriptionAndShowModal]);

  // Use background-aware timer for 30-minute countdown (works in background)
  const { formattedTime } = useBackgroundTimer({
    totalDuration: CONSULTATION_DURATION,
    isActive: chatType === 'doctor' && isConsultationActive,
    onTimeUpRef: checkPrescriptionAndShowModalRef,
  });

  // Memoized consultation time display
  const consultationTime = useMemo(
    () => formattedTime,
    [formattedTime],
  );

  // Auto-scroll when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // Setup Pusher listeners for real-time messages
  useEffect(() => {
    console.log('📞 [ChatScreen] Pusher effect triggered - patientID:', patientID, 'consultationID:', consultationID, 'type:', typeof consultationID, 'chatType:', chatType);
    if (!patientID || !consultationID || chatType !== 'doctor') {
      console.log('📞 [ChatScreen] Skipping Pusher setup - missing requirements:', { patientID: !!patientID, consultationID: !!consultationID, chatType });
      return;
    }

    let isMounted = true;

    // Initialize Pusher
    pusherService.initialize();

    // Subscribe to sender channel (when patient sends a message)
    const senderChannelName = `send-message${patientID}`;
    const receiverChannelName = `received-message${patientID}`;

    // Handler for message-sent event (confirmation that message was sent)
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
      if (!isMounted) return;

      // Extract message from data.message if it exists (Pusher event structure)
      // Handle both structures: {message: {consultationID: ...}} and {consultationID: ...}
      const messageData = data?.message || data;
      const messageConsultationID =
        messageData?.consultationID ||
        data?.consultationID ||
        data?.consultation_id ||
        (typeof messageData === 'object' && messageData !== null ? messageData.consultationID : null);

      // If the message is for this consultation, silently reload all messages
      if (messageConsultationID && (messageConsultationID === consultationID || messageConsultationID === String(consultationID))) {
        // Silently reload messages without showing loader
        fetchConsultationMessages(true);
      }
    };

    // Handler for message-received event (new message received)
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      if (!isMounted) return;

      // Extract message from data.message if it exists (Pusher event structure)
      // Handle structure: {message: {consultationID: 35, ...}}
      const messageData = data?.message || data;

      // Extract consultationID - handle nested structure
      const messageConsultationID =
        messageData?.consultationID ||
        data?.consultationID ||
        data?.consultation_id ||
        null;

      // Normalize IDs for comparison (convert to string)
      const normalizedMessageConsultationID = messageConsultationID ? String(messageConsultationID) : null;
      const normalizedConsultationID = consultationID ? String(consultationID) : null;

      console.log('Message received - consultationID:', normalizedMessageConsultationID, 'Current consultationID:', normalizedConsultationID);

      // If the message is for this consultation
      if (normalizedMessageConsultationID && normalizedConsultationID && normalizedMessageConsultationID === normalizedConsultationID) {
        // Transform and append the message directly from Pusher response
        if (messageData && messageData.id) {
          const doctorData = consultationData?.doctor || doctorInfo;
          const patientData = consultationData?.patient;

          const isUser = messageData.senderID === patientID ||
            messageData.senderType === 'patient' ||
            messageData.senderRole === 'patient' ||
            messageData.sender?.type === 'patient';

          const senderInfo = messageData.sender;
          const newMessage: Message = {
            id: String(messageData.id),
            type: isUser ? 'user' : 'bot',
            text: messageData.message || '',
            timestamp: messageData.dateTime || messageData.created_at || getCurrentTimestamp(),
            user: isUser
              ? {
                name: senderInfo?.name || patientData?.name || 'You',
                avatar: senderInfo?.image ? { uri: senderInfo.image } : (patientData?.image ? { uri: patientData.image } : patient)
              }
              : showAvatar && doctorData
                ? {
                  name: senderInfo?.name || doctorData.name || doctorInfo.name,
                  avatar: senderInfo?.image ? { uri: senderInfo.image } : (doctorData.image ? { uri: doctorData.image } : doctorInfo.avatar)
                }
                : showAvatar && doctorInfo
                  ? { name: doctorInfo.name, avatar: doctorInfo.avatar }
                  : undefined,
            images: (() => {
              const imagePath = messageData.file || messageData.image || messageData.fileUrl;
              if (!imagePath) return undefined;

              const fullImageUri = imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('file://')
                ? `https://telehealth.repla-projects.com/${imagePath}`
                : imagePath;

              return [{ uri: fullImageUri }];
            })(),
          };

          // Append message if it doesn't already exist
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping append:', newMessage.id);
              return prev;
            }
            console.log('Appending new message from Pusher:', newMessage.id);
            return [...prev, newMessage];
          });
        }

        // Also silently reload messages to ensure we have the latest state
        console.log('Calling fetchConsultationMessages(true) to refresh messages...');
        fetchConsultationMessages(true).catch(err => {
          console.error('Error in fetchConsultationMessages:', err);
        });
      } else {
        console.log('Consultation ID mismatch - not refreshing messages');
        console.log('Message consultationID:', normalizedMessageConsultationID, 'Current:', normalizedConsultationID);
      }
    };

    // Bind events
    try {
      pusherService.bind(senderChannelName, 'message-sent', handleMessageSent);
    } catch (err) {
      console.error('Error binding to sender channel:', err);
    }

    try {
      pusherService.bind(receiverChannelName, 'message-received', handleMessageReceived);
    } catch (err) {
      console.error('Error binding to receiver channel:', err);
    }

    // Subscribe to consultation-end channel to listen when the other side ends the consultation
    // Only subscribe if consultationID exists
    let consultationEndChannelName: string | null = null;
    if (!consultationID) {
      console.log('⚠️ [ChatScreen] consultationID is missing, skipping consultation-end subscription');
    } else {
      consultationEndChannelName = `webrtc-consultation${consultationID}`;
      console.log('📞 [ChatScreen] Subscribing to consultation-end channel:', consultationEndChannelName, 'consultationID:', consultationID, 'type:', typeof consultationID);

      const handleConsultationEnd = (eventPayload: any) => {
        console.log('📞 [ChatScreen] Consultation end event received (raw):', JSON.stringify(eventPayload, null, 2));
        console.log('📞 [ChatScreen] Event payload type:', typeof eventPayload, 'has data property:', !!eventPayload?.data);
        console.log('📞 [ChatScreen] Current state - isMounted:', isMounted, 'consultationEndedRef:', consultationEndedRef.current, 'consultationID:', consultationID, 'type:', typeof consultationID);
        
        if (!isMounted || consultationEndedRef.current) {
          console.log('📞 [ChatScreen] Ignoring event - isMounted:', isMounted, 'consultationEndedRef:', consultationEndedRef.current);
          return;
        }

        // Handle nested data structure: { data: { consultationID: ... } } or direct { consultationID: ... }
        // Try multiple ways to extract the data
        let data = eventPayload;
        if (eventPayload?.data && typeof eventPayload.data === 'object') {
          data = eventPayload.data;
          console.log('📞 [ChatScreen] Using nested data structure');
        } else {
          console.log('📞 [ChatScreen] Using direct payload');
        }
        
        const eventConsultationID = data?.consultationID || data?.id || eventPayload?.consultationID || eventPayload?.id;
        const fromUser = (data?.from || eventPayload?.from || '').toString();
        
        console.log('📞 [ChatScreen] Extracted - eventConsultationID:', eventConsultationID, 'type:', typeof eventConsultationID, 'fromUser:', fromUser, 'consultationID:', consultationID, 'type:', typeof consultationID);
        
        // Check if this event is from the other side (doctor), not from ourselves (patient)
        // If we (patient) sent this event, ignore it
        const isFromPatient = fromUser && fromUser.startsWith('patient_');
        if (isFromPatient) {
          console.log('📞 [ChatScreen] Ignoring own event from:', fromUser);
          return;
        }
        
        // Compare IDs - ensure both are converted to strings for reliable comparison
        const eventIDStr = eventConsultationID?.toString() || '';
        const consultationIDStr = consultationID?.toString() || '';
        const idsMatch = eventIDStr && consultationIDStr && eventIDStr === consultationIDStr;
        
        console.log('📞 [ChatScreen] ID comparison - eventIDStr:', eventIDStr, 'consultationIDStr:', consultationIDStr, 'match:', idsMatch);
        
        // Check if this is for our consultation
        if (idsMatch) {
          console.log('✅ [ChatScreen] Consultation ended by doctor, showing modal');
          consultationEndedRef.current = true;
          setIsConsultationActive(false);
          
          // Show modal without fetching prescription upfront
          // Prescription will only be fetched when user clicks the button
          setHasPrescription(true); // Always show button
          setModalVisible(true);
        } else {
          console.log('❌ [ChatScreen] Event consultationID mismatch - eventIDStr:', eventIDStr, 'consultationIDStr:', consultationIDStr);
        }
      };

      try {
        pusherService.bind(consultationEndChannelName, 'consultation-end', handleConsultationEnd);
        console.log('✅ [ChatScreen] Bound to consultation-end event on channel:', consultationEndChannelName);
      } catch (err) {
        console.error('❌ [ChatScreen] Error binding to consultation-end channel:', err);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      pusherService.unbind(senderChannelName, 'message-sent');
      pusherService.unbind(receiverChannelName, 'message-received');
      try {
        pusherService.unsubscribe(senderChannelName);
      } catch (err) {
        console.error('Error unsubscribing from sender channel:', err);
      }
      try {
        pusherService.unsubscribe(receiverChannelName);
      } catch (err) {
        console.error('Error unsubscribing from receiver channel:', err);
      }
      // Cleanup consultation-end channel if it was subscribed
      if (consultationEndChannelName) {
        try {
          pusherService.unbind(consultationEndChannelName, 'consultation-end');
          pusherService.unsubscribe(consultationEndChannelName);
          console.log('✅ [ChatScreen] Unsubscribed from consultation-end channel:', consultationEndChannelName);
        } catch (err) {
          console.error('Error unsubscribing from consultation-end channel:', err);
        }
      }
    };
  }, [patientID, consultationID, chatType, consultationData, doctorInfo, showAvatar, fetchConsultationMessages, checkPrescriptionAndShowModal]);

  // ---------- Handlers ----------
  const handleImagePick = useCallback(async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          return;
        }

        if (response.errorCode) {
          console.error('Image Picker Error:', response.errorMessage);
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          console.error('No image URI found');
          return;
        }

        // Optimistically add message to UI with uploading state
        const tempId = `temp-img-${Date.now()}`;
        const newMessage: Message = {
          id: tempId,
          type: 'user',
          text: '',
          timestamp: getCurrentTimestamp(),
          user: showAvatar
            ? {
              name: profileData?.name || 'You',
              avatar: patientProfileAvatar
            }
            : undefined,
          images: [{ uri: asset.uri, isUploading: true }],
        };

        setMessages(prev => [...prev, newMessage]);

        // Send image via API if consultationID exists
        if (consultationID && recipientID) {
          try {
            const formData = new FormData();
            formData.append('recipientID', recipientID);
            formData.append('message', '');
            formData.append('consultationID', consultationID);

            // Append file if available
            if (asset.uri) {
              formData.append('file', {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || 'image.jpg',
              } as any);
            }

            // Use fetch instead of apiClient for FormData
            const token = useAuthStore.getState().auth?.token;
            const response = await fetch(`${BASE_URL}${API.CONSULTATIONS.SEND_MESSAGE}`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type - let fetch set it automatically with boundary
              },
            });

            const data = await response.json();
            console.log('Send image message response:', data);

            if (!response.ok || data.success === false) {
              throw new Error(data.message || 'Failed to send image');
            }

            // Update message to remove uploading state and update ID
            setMessages(prev =>
              prev.map(msg =>
                msg.id === tempId
                  ? {
                    ...msg,
                    id: String(data?.data?.id || data?.id || tempId),
                    images: msg.images?.map(img => ({ ...img, isUploading: false })),
                  }
                  : msg
              )
            );

            // Note: Pusher event (message-sent) will handle refreshing messages silently
            // No need to reload all messages here
          } catch (error: any) {
            console.error('Error sending image message:', error);
            Toast.error(error?.message || 'Failed to send image');
            // Remove the optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
          }
        } else {
          // No consultation ID, just remove uploading state
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? {
                  ...msg,
                  images: msg.images?.map(img => ({ ...img, isUploading: false })),
                }
                : msg
            )
          );
        }
      },
    );
  }, [showAvatar, consultationID, recipientID]);

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Optimistically add message to UI
    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      type: 'user',
      text: trimmedMessage,
      timestamp: getCurrentTimestamp(),
      user: showAvatar
        ? {
          name: profileData?.name || 'You',
          avatar: patientProfileAvatar
        }
        : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Send message via API if consultationID exists
    if (consultationID && recipientID) {
      try {
        const formData = new FormData();
        formData.append('recipientID', String(recipientID));
        formData.append('message', trimmedMessage);
        formData.append('consultationID', String(consultationID));
        formData.append('file', ''); // Empty file field

        // Use fetch instead of apiClient for FormData
        const token = useAuthStore.getState().auth?.token;
        const response = await fetch(`${BASE_URL}${API.CONSULTATIONS.SEND_MESSAGE}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type - let fetch set it automatically with boundary
          },
        });

        const data = await response.json();
        console.log('Send message response:', data);

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Failed to send message');
        }

        // Update message ID with API response if available
        if (data?.data?.id || data?.id) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? {
                  ...msg,
                  id: String(data?.data?.id || data?.id),
                }
                : msg
            )
          );
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        Toast.error(error?.message || 'Failed to send message');
        // Remove the optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    }
  }, [message, showAvatar, consultationID, recipientID]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (messageID: string) => {
    if (!messageID) return;

    Alert.alert(
      t('delete_message') || 'Delete Message',
      t('are_you_sure_delete_message') || 'Are you sure you want to delete this message?',
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(
                `${API.CONSULTATIONS.DELETE_MESSAGE}/${messageID}`
              );

              // Remove message from UI
              setMessages(prev => prev.filter(msg => msg.id !== messageID));
              Toast.success(t('message_deleted') || 'Message deleted');
            } catch (error: any) {
              console.error('Error deleting message:', error);
              Toast.error(error?.message || 'Failed to delete message');
            }
          },
        },
      ]
    );
  }, [t]);

  const handleServicePress = useCallback((service: Service) => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  }, []);

  const handleAddToCart = async service => {
    // Before adding to cart, check profile completeness on server
    try {
      const checkRes = await apiClient.get(API.CONSULTATIONS.CHECK_PROFILE);
      const checkData = checkRes.data?.data || checkRes.data;
      const isComplete = checkData?.is_complete ?? checkData?.isComplete ?? checkRes.data?.success;
      if (checkRes.data?.success === false || isComplete === false) {
        const msg = checkRes.data?.message || 'Please complete your profile before proceeding';
        Toast.error(msg);
        try {
          const { navigateToProfileSetting } = require('@navigation/root-navigation');
          navigateToProfileSetting();
        } catch (e) {
          navigation.navigate('Setting', { screen: 'ProfileSetting' });
        }
        return;
      }
    } catch (err) {
      console.warn('checkProfile failed, proceeding to add to cart:', err);
    }

    const cartItem = {
      service: service,
      clinic: {
        id: `clinic_${Date.now()}`,
        name: 'AI Health Clinic',
        location: 'None',
        image: RecommandImage,
        specialty: 'General',
        rating: 3,
      },
    };

    addToCart(cartItem);

    console.log('Service added to cart:', cartItem);

    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = useCallback(
    service => {
      setServiceDetailVisible(false);
      navigation.navigate('CheckoutScreen', {
        services: [
          {
            service: service,
            clinic: {
              id: `clinic_${Date.now()}`,
              name: 'AI Health Clinic',
              location: 'None',
              image: RecommandImage,
              specialty: 'General',
              rating: 3,
            },
          },
        ],
        fromCart: false,
      });
    },
    [navigation],
  );

  const handleEndConsultation = useCallback(async () => {
    setIsConsultationActive(false);
    await checkPrescriptionAndShowModal();
  }, [checkPrescriptionAndShowModal]);

  const handleGetPrescription = useCallback(async () => {
    // Fetch prescription when user clicks the button
    if (consultationID) {
      try {
        console.log('Fetching prescription for consultation:', consultationID);
        const endpoint = `${API.HISTORY.GET_PRESCRIPTION}/${consultationID}`;
        const response = await apiClient.get(endpoint);
        console.log('Prescription fetched:', response.data);

        // Check if prescription exists
        if (response.data?.success !== false &&
          response.data?.prescriptions &&
          Array.isArray(response.data.prescriptions) &&
          response.data.prescriptions.length > 0) {
          console.log('Prescription found, navigating to PrescriptionScreen');
        } else {
          console.log('No prescription found');
        }
      } catch (error) {
        console.error('Error fetching prescription:', error);
      }
    }

    setModalVisible(false);
    const clinicID = clinicInfoState?.id || consultationData?.clinicID;
    const clinic = clinicID
      ? {
          id: clinicID,
          name: clinicInfoState?.name || clinicInfoState?.clinicName || '',
          location: clinicInfoState?.location || '',
          image: clinicInfoState?.image,
          specialty: 'General',
          rating: 0,
        }
      : null;
    navigation.navigate('PrescriptionScreen', {
      consultationID: consultationID,
      fromChat: true,
      clinic,
      clinicID,
    });
  }, [navigation, consultationID, clinicInfoState, consultationData]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('EntryPoint');
  }, []);

  const handleGoBack = useCallback(async () => {
    // Show confirmation dialog before going back
    if (chatType === 'doctor' && !fromHistory && isConsultationActive) {
      // Check prescription before showing modal
      await checkPrescriptionAndShowModal();
      return true; // Prevent default back action
    }
    navigation.goBack();
  }, [navigation, chatType, fromHistory, isConsultationActive, checkPrescriptionAndShowModal]);

  // Override back button behavior
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (chatType === 'doctor' && !fromHistory && isConsultationActive) {
        handleGoBack();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [chatType, fromHistory, isConsultationActive, handleGoBack]);

  const handleCartPress = () => {
    navigation.navigate('CartScreen');
  };

  const handleVisitClinic = useCallback(async () => {
    if (fromHistory) {
      // Replace Chat with ClinicDetail so back from clinic goes to previous screen (e.g. History), not Chat
      const clinicID = clinicInfoState?.id || consultationData?.clinicID;
      navigation.replace('ClinicDetail', {
        clinic: {
          id: clinicID,
          name: clinicInfoState?.name || clinicInfoState?.clinicName || '',
          location: clinicInfoState?.location || '',
          image: clinicInfoState?.image,
          specialty: 'General',
          rating: 0,
        },
        clinicID: clinicID,
      });
    } else {
      // Show confirmation modal asking user if they want to end consultation
      setShowEndConsultationModal(true);
    }
  }, [fromHistory, clinicInfoState, consultationData, navigation]);

  const handleConfirmEndConsultation = useCallback(async () => {
    setShowEndConsultationModal(false);
    
    // End the consultation first
    await endConsultationAndNotify();
    
    // Navigate to clinic detail
    const clinicID = clinicInfoState?.id || consultationData?.clinicID;
    navigation.replace('ClinicDetail', {
      clinic: {
        id: clinicID,
        name: clinicInfoState?.name || clinicInfoState?.clinicName || '',
        location: clinicInfoState?.location || '',
        image: clinicInfoState?.image,
        specialty: 'General',
        rating: 0,
      },
      clinicID: clinicID,
    });
  }, [clinicInfoState, consultationData, navigation, endConsultationAndNotify]);

  const insets = useSafeAreaInsets();
  const inputPadding = {
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
  };
  const screenPadding = {
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  // ---------- Main Render ----------
  return (
    <View style={[styles.container, screenPadding]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={
          flexToggle
            ? [{ flexGrow: 1 }, styles.container]
            : [{ flex: 1 }, styles.container]
        }
        enabled={!flexToggle}
      >
        <View style={styles.content}>
        <ChatHeader
          chatType={chatType}
          doctorInfo={doctorInfo}
          consultationTime={consultationTime}
          consultationElapsed={calculateDuration()}
          fromHistory={fromHistory}
          handleGoBack={handleGoBack}
          handleEndConsultation={handleEndConsultation}
          handleCart={handleCartPress}
          isConsultationActive={isConsultationActive}
          consultationData={consultationData}
          consultationEnded={consultationEndedState}
          consultationDuration={consultationDuration}
        />

        {/* Clinic Info Bar */}
        {chatType === 'doctor' && clinicInfoState && (
          <View style={styles.clinicInfo}>
            <View style={styles.clinicLeft}>
              {clinicInfoState.image ? (
                <Image
                  source={typeof clinicInfoState.image === 'string' && clinicInfoState.image.startsWith('http')
                    ? { uri: clinicInfoState.image }
                    : typeof clinicInfoState.image === 'string'
                    ? { uri: `https://telehealth.repla-projects.com/${clinicInfoState.image}` }
                    : clinicInfoState.image}
                  style={styles.clinicImage}
                />
              ) : (
                <ClinicAvatar name={clinicInfoState.name || clinicInfoState.clinicName} size={48} style={styles.clinicImage} />
              )}
              <View>
                <Text style={styles.clinicName}>{clinicInfoState.name || clinicInfoState.clinicName}</Text>
                <Text style={styles.clinicLocation}>{clinicInfoState.location || clinicInfoState.address || ''}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.consultButton} onPress={handleVisitClinic}>
              <Text style={styles.consultButtonText}>{t('visit') || 'Visit'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        {!modalVisible && (
          <>
            {loadingMessages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B46C1" />
                <Text style={styles.loadingText}>{t('loading_messages') || 'Loading messages...'}</Text>
              </View>
            ) : (
              <MessageList
                messages={messages}
                scrollRef={scrollRef}
                showAvatar={showAvatar}
                handleServicePress={handleServicePress}
                handleDeleteMessage={handleDeleteMessage}
              />
            )}
          </>
        )}
        </View>

        {/* Input - apply safe area insets manually so bar is never clipped (SafeAreaView unreliable on stack screens) */}
        {!modalVisible && (
          <View style={[styles.inputWrapper, inputPadding]}>
            <MessageInput
              message={message}
              setMessage={setMessage}
              handleSend={handleSend}
              handleImagePick={handleImagePick}
              canSendMessages={canSendMessages}
            />
          </View>
        )}

        {/* Modals */}
        <ServiceDetailBottomSheet
          visible={serviceDetailVisible}
          onClose={() => setServiceDetailVisible(false)}
          service={selectedService}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckout}
        />
        <ConsultationEndedModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onGetPrescription={handleGetPrescription}
          hasPrescription={hasPrescription}
        />
        <ConsultDoctorBottomSheet
          visible={showBottomSheet}
          onClose={() => setShowBottomSheet(false)}
        />
        <ConfirmationModal
          visible={showEndConsultationModal}
          title={t('End Consultation')}
          message={t('Do you want to end this consultation and visit the clinic?')}
          confirmText={t('Yes')}
          cancelText={t('No')}
          onConfirm={handleConfirmEndConsultation}
          onCancel={() => setShowEndConsultationModal(false)}
          confirmButtonStyle="destructive"
        />
      </KeyboardAvoidingView>
    </View>
  );
}
