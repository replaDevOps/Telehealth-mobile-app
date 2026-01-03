import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { styles } from './style';
import { patient, RecommandImage } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
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
  formatTime,
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
import { pusherService } from '@services/pusher/PusherService';

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  const { t } = useTranslation();
  // Extract route params with defaults
  const chatType = route?.params?.chatType || 'ai';
  const fromHistory = route?.params?.fromHistory || false;
  const doctorInfo = route?.params?.doctorInfo || DEFAULT_DOCTOR_INFO;
  const clinicInfo = route?.params?.clinicInfo || DEFAULT_CLINIC_INFO;
  const consultationID = route?.params?.consultationID;
  const recipientID = route?.params?.recipientID;
  const { addToCart } = useCart();

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    CONSULTATION_DURATION,
  );
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor' && !fromHistory,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [consultationData, setConsultationData] = useState<any>(null);
  const [storedClinicInfo, setStoredClinicInfo] = useState(clinicInfo);

  const scrollRef = useRef<ScrollView>(null);
  const auth = useAuthStore(state => state.auth);
  const patientID = auth?.id;

  useEffect(() => {
    console.log('clinicInfo.image type:', typeof clinicInfo.image);
    console.log('clinicInfo.image value:', clinicInfo.image);
  }, []);

  // ---------- Memoized Values ----------
  const initialMessages = useMemo(
    () => getInitialMessages(chatType, doctorInfo),
    [chatType, doctorInfo],
  );

  const consultationTime = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds],
  );

  const showAvatar = chatType === 'doctor';
  const canSendMessages = !fromHistory;

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
  const fetchConsultationMessages = useCallback(async () => {
    if (!consultationID) return;

    setLoadingMessages(true);
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
        const clinicDataFromAPI = consultationDataFromAPI?.clinic;
        const serviceDataFromAPI = consultationDataFromAPI?.service;

        // Store consultation data
        setConsultationData(consultationDataFromAPI);

        // Update clinic info from API if available
        // Note: The API response might not include clinic object, only clinicID
        // Use service data as fallback for clinic image/name
        if (clinicDataFromAPI) {
          setStoredClinicInfo({
            id: clinicDataFromAPI.id || clinicDataFromAPI.clinicID || consultationDataFromAPI?.clinicID,
            name: clinicDataFromAPI.clinicName || clinicDataFromAPI.name || clinicInfo.name,
            location: clinicDataFromAPI.location || clinicDataFromAPI.city || clinicInfo.location,
            image: clinicDataFromAPI.image ? { uri: clinicDataFromAPI.image } : clinicInfo.image,
          });
        } else if (serviceDataFromAPI) {
          // If no clinic data, use service data as fallback for image
          // Service has clinicID and image, which we can use
          setStoredClinicInfo({
            id: consultationDataFromAPI?.clinicID || clinicInfo.id,
            name: clinicInfo.name || serviceDataFromAPI.name || 'Clinic',
            location: clinicInfo.location || 'Location not available',
            image: serviceDataFromAPI.image ? { uri: serviceDataFromAPI.image } : clinicInfo.image,
          });
        } else {
          // If no clinic or service data, keep using clinicInfo from route params
          console.log('No clinic or service data in API response, using clinicInfo from route params');
          // storedClinicInfo is already initialized with clinicInfo from route params
        }


        // Update doctorInfo if available from API
        if (doctorData && chatType === 'doctor') {
          // You could update doctorInfo here if needed
          console.log('Doctor data from API:', doctorData);
        }

        const mappedMessages: Message[] = apiMessages.map((msg: any) => {
          // Determine if message is from user (patient) or doctor
          // Compare senderID with patientID and doctorID from consultation data
          const isUser = msg.senderID === patientData?.id ||
            msg.senderType === 'patient' ||
            msg.senderRole === 'patient' ||
            (msg.patientID && msg.patientID === patientData?.id);

          return {
            id: String(msg.id || msg.messageID || Date.now()),
            type: isUser ? 'user' : 'bot',
            text: msg.message || msg.text || msg.content || '',
            timestamp: msg.created_at || msg.timestamp || msg.createdAt || getCurrentTimestamp(),
            user: isUser
              ? {
                name: patientData?.name || 'You',
                avatar: patientData?.image ? { uri: patientData.image } : patient
              }
              : showAvatar && doctorData
                ? {
                  name: doctorData.name || doctorInfo.name,
                  avatar: doctorData.image ? { uri: doctorData.image } : doctorInfo.avatar
                }
                : showAvatar && doctorInfo
                  ? { name: doctorInfo.name, avatar: doctorInfo.avatar }
                  : undefined,
            images: (() => {
              const imagePath = msg.file || msg.image || msg.fileUrl;
              if (!imagePath) return undefined;

              // If image path doesn't start with http, prepend BASE_URL
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
      Toast.error(error?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [consultationID, recipientID, showAvatar, doctorInfo, chatType]);

  // Timer for doctor consultation
  useEffect(() => {
    if (chatType !== 'doctor' || !isConsultationActive) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsConsultationActive(false);
          setModalVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConsultationActive, chatType]);

  // Auto-scroll when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // Setup Pusher listeners for real-time messages
  useEffect(() => {
    if (!patientID || !consultationID || chatType !== 'doctor') {
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
      // If the message is for this consultation, refresh messages
      if (data?.consultationID === consultationID || data?.consultation_id === consultationID) {
        // Optionally refresh messages or update UI
        fetchConsultationMessages();
      }
    };

    // Handler for message-received event (new message received)
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      if (!isMounted) return;
      // If the message is for this consultation, add it to messages
      if (data?.consultationID === consultationID || data?.consultation_id === consultationID) {
        // Map the received message to Message format
        const doctorData = consultationData?.doctor || doctorInfo;
        const patientData = consultationData?.patient;

        const isUser = data?.senderID === patientID ||
          data?.senderType === 'patient' ||
          data?.senderRole === 'patient';

        const newMessage: Message = {
          id: String(data?.id || data?.messageID || Date.now()),
          type: isUser ? 'user' : 'bot',
          text: data?.message || data?.text || data?.content || '',
          timestamp: data?.created_at || data?.timestamp || data?.createdAt || getCurrentTimestamp(),
          user: isUser
            ? {
              name: patientData?.name || 'You',
              avatar: patientData?.image ? { uri: patientData.image } : patient
            }
            : showAvatar && doctorData
              ? {
                name: doctorData.name || doctorInfo.name,
                avatar: doctorData.image ? { uri: doctorData.image } : doctorInfo.avatar
              }
              : showAvatar && doctorInfo
                ? { name: doctorInfo.name, avatar: doctorInfo.avatar }
                : undefined,
          images: (() => {
            const imagePath = data?.file || data?.image || data?.fileUrl;
            if (!imagePath) return undefined;

            const fullImageUri = imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('file://')
              ? `https://telehealth.repla-projects.com/${imagePath}`
              : imagePath;

            return [{ uri: fullImageUri }];
          })(),
        };

        // Add message to state if it doesn't already exist
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
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
    };
  }, [patientID, consultationID, chatType, consultationData, doctorInfo, showAvatar, fetchConsultationMessages]);

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

        // Optimistically add message to UI
        const tempId = Date.now().toString();
        const newMessage: Message = {
          id: tempId,
          type: 'user',
          text: '',
          timestamp: getCurrentTimestamp(),
          user: showAvatar
            ? { name: 'You', avatar: patient }
            : undefined,
          images: [{ uri: asset.uri }],
        };

        setMessages(prev => [...prev, newMessage]);

        // Send image via API if consultationID exists
        if (consultationID && recipientID) {
          try {
            setSendingMessage(true);
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
            console.error('Error sending image message:', error);
            Toast.error(error?.message || 'Failed to send image');
            // Remove the optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
          } finally {
            setSendingMessage(false);
          }
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
        ? { name: 'You', avatar: patient }
        : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Send message via API if consultationID exists
    if (consultationID && recipientID) {
      try {
        setSendingMessage(true);
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
      } finally {
        setSendingMessage(false);
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

  const handleAddToCart = service => {
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

  const handleEndConsultation = useCallback(() => {
    setIsConsultationActive(false);
    setModalVisible(true);
  }, []);

  const handleGetPrescription = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('PrescriptionScreen', {
      consultationID: consultationID,
    });
  }, [navigation, consultationID]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('EntryPoint');
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCartPress = () => {
    navigation.navigate('CartScreen');
  };

  // ---------- Main Render ----------
  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        chatType={chatType}
        doctorInfo={doctorInfo}
        consultationTime={consultationTime}
        fromHistory={fromHistory}
        handleGoBack={handleGoBack}
        handleEndConsultation={handleEndConsultation}
        handleCart={handleCartPress}
      />

      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image
            source={
              typeof storedClinicInfo.image === 'number'
                ? { uri: Image.resolveAssetSource(storedClinicInfo.image).uri }
                : storedClinicInfo.image
            }
            style={styles.clinicImage}
          />
          <View>
            <Text style={styles.clinicName}>{storedClinicInfo.name}</Text>
            <Text style={styles.clinicLocation}>{storedClinicInfo.location}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.consultButton}
          onPress={() => {
            if (chatType === 'doctor') {
              // Navigate to ClinicDetail with clinic data
              // Use clinicID from consultation data if available, otherwise use stored clinic info
              const clinicID = consultationData?.clinicID || consultationData?.clinic?.id || consultationData?.clinic?.clinicID;
              const clinicToNavigate = consultationData?.clinic || storedClinicInfo;

              navigation.navigate('ClinicDetail', {
                clinic: {
                  id: clinicID || clinicToNavigate?.id || clinicToNavigate?.clinicID || storedClinicInfo.id,
                  name: clinicToNavigate?.clinicName || clinicToNavigate?.name || storedClinicInfo.name,
                  location: clinicToNavigate?.location || clinicToNavigate?.city || storedClinicInfo.location,
                  image: clinicToNavigate?.image ? { uri: clinicToNavigate.image } : storedClinicInfo.image,
                  specialty: consultationData?.service?.serviceType || consultationData?.service?.name || 'General',
                  rating: 0, // API doesn't provide rating in consultation data
                },
              });
            } else {
              setShowBottomSheet(true);
            }
          }}
        >
          <Text style={styles.consultButtonText}>
            {chatType === 'doctor' ? t('visit') : t('consult_now')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
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

      {/* Input - Only show if not viewing history */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        handleImagePick={handleImagePick}
        canSendMessages={canSendMessages}
      />

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
      />
      <ConsultDoctorBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      />
    </SafeAreaView>
  );
}
