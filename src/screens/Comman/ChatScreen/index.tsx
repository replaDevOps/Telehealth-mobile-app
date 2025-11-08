import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { styles } from './style';
import { patient } from '@assets/images';
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

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  // Extract route params with defaults
  const chatType = route?.params?.chatType || 'ai';
  const fromHistory = route?.params?.fromHistory || false;
  const doctorInfo = route?.params?.doctorInfo || DEFAULT_DOCTOR_INFO;
  const clinicInfo = route?.params?.clinicInfo || DEFAULT_CLINIC_INFO;

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

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('clinicInfo.image type:', typeof clinicInfo.image);
    console.log('clinicInfo.image value:', clinicInfo.image);
  }, []);

  // ---------- Memoized Values ----------
  const initialMessages = useMemo(
    () => getInitialMessages(chatType, doctorInfo),
    [chatType, doctorInfo], // Only recreate if chatType or doctor changes
  );

  const consultationTime = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds],
  );

  const showAvatar = chatType === 'doctor';
  const canSendMessages = !fromHistory;

  // ---------- Lifecycle ----------
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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

  // ---------- Handlers ----------
  const handleImagePick = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
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

        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          text: '',
          timestamp: getCurrentTimestamp(),
          user: showAvatar
            ? { name: 'Bassil Kuncill Saadeh', avatar: patient }
            : undefined,
          images: [{ uri: asset.uri }],
        };

        setMessages(prev => [...prev, newMessage]);
      },
    );
  }, [showAvatar]);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: trimmedMessage,
      timestamp: getCurrentTimestamp(),
      user: showAvatar
        ? { name: 'Bassil Kuncill Saadeh', avatar: patient }
        : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // TODO: Integrate with actual chat API
    // simulateBotResponse(trimmedMessage);
  }, [message, showAvatar]);

  const handleServicePress = useCallback((service: Service) => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  }, [navigation]);

  const handleCheckout = useCallback(() => {
    setServiceDetailVisible(false);
    navigation.navigate('CheckoutScreen');
  }, [navigation]);

  const handleEndConsultation = useCallback(() => {
    setIsConsultationActive(false);
    setModalVisible(true);
  }, []);

  const handleGetPrescription = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('PrescriptionScreen');
  }, [navigation]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
      />

      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image
            source={
              typeof clinicInfo.image === 'number'
                ? { uri: Image.resolveAssetSource(clinicInfo.image).uri }
                : clinicInfo.image
            }
            style={styles.clinicImage}
          />
          <View>
            <Text style={styles.clinicName}>{clinicInfo.name}</Text>
            <Text style={styles.clinicLocation}>{clinicInfo.location}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.consultButton}>
          <Text style={styles.consultButtonText}>
            {chatType === 'doctor' ? 'Visit' : 'Consult Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <MessageList
        messages={messages}
        scrollRef={scrollRef}
        showAvatar={showAvatar}
        handleServicePress={handleServicePress}
      />

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
    </SafeAreaView>
  );
}
