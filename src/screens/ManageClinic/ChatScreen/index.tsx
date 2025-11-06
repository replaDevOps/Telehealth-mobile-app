import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { Header2 } from '@components/common/Header2';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import {
  doctor,
  patient,
  pimples,
  PipsImage,
  RecommandImage,
} from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { launchImageLibrary } from 'react-native-image-picker';

// ---------- Types ----------
type Message = {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  user?: { name: string; avatar: any };
  images?: any[];
  suggestions?: Service[];
};

type Service = {
  id: string;
  image: any;
  type: string;
  serviceGroup: string;
  serviceName: string;
  price: string;
  duration: string;
  description: string;
  procedure: string;
};

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  const chatType: 'ai' | 'doctor' = route?.params?.chatType || 'ai';

  const doctorInfo = route?.params?.doctorInfo || {
    id: 'doctor_1',
    name: 'Dr. Sultan Khan',
    avatar: doctor,
    serviceName: '',
  };

  const clinicInfo = route?.params?.clinicInfo || {
    name: 'Eden Medical Center',
    location: 'Madina, Saudi Arabia, 2.2km',
    image: RecommandImage,
  };

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor',
  );
  const [modalVisible, setModalVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // ---------- Lifecycle ----------
  useEffect(() => {
    setMessages(getInitialMessages(chatType, doctorInfo));
  }, [chatType]);

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

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        console.log('Image Picker Error: ', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;

        // create message with correct structure
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          text: '',
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          user:
            chatType === 'doctor'
              ? { name: 'Bassil Kuncill Saadeh', avatar: patient }
              : undefined,
          images: [{ uri: imageUri }], // 👈 correct field + wrapped in array
        };

        setMessages(prev => [...prev, newMessage]);
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    });
  };

  // ---------- Handlers ----------
  const handleSend = useCallback(() => {
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      user:
        chatType === 'doctor'
          ? { name: 'Bassil Kuncill Saadeh', avatar: patient }
          : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [message, chatType]);

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  };

  const handleAddToCart = () => {
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = () => {
    setServiceDetailVisible(false);
    navigation.navigate('CheckoutScreen');
  };

  const handleEndConsultation = () => {
    setIsConsultationActive(false);
    setModalVisible(true);
  };

  const handleGetPrescription = () => {
    setModalVisible(false);
    navigation.navigate('PrescriptionScreen');
  };

  const handleCloseModal = () => setModalVisible(false);

  // ---------- Helpers ----------
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const consultationTime = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds],
  );

  // ---------- Renderers ----------
  const renderHeader = () =>
    chatType === 'ai' ? (
      <Header2 title="Chat" showCart logo />
    ) : (
      <View style={styles.doctorHeaderContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.doctorHeaderCenter}>
          <Text style={styles.doctorName}>{doctorInfo.name}</Text>
          <Text style={styles.consultationTime}>
            {doctorInfo.serviceName || consultationTime}
          </Text>
        </View>

        {!doctorInfo.serviceName && (
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndConsultation}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        )}
      </View>
    );

  const renderSuggestions = (suggestions: Service[]) => (
    <View style={styles.suggestionsContainer}>
      {suggestions.map(service => (
        <TouchableOpacity
          key={service.id}
          style={styles.suggestionCard}
          onPress={() => handleServicePress(service)}
        >
          <Image source={service.image} style={styles.suggestionImage} />
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>{service.serviceGroup}</Text>
            <View style={styles.suggestionSubtitleRow}>
              <Text style={styles.suggestionSubtitle}>
                {service.serviceName}
              </Text>
              <FontAwesome5
                name="external-link-alt"
                size={12}
                color={colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.type === 'user';
    const showAvatar = chatType === 'doctor';

    return (
      <View key={msg.id || index} style={styles.messageContainer}>
        {/* Bot Message */}
        {!isUser && (
          <View style={[showAvatar && styles.botMessageWithAvatar]}>
            {showAvatar && (
              <Image source={msg.user?.avatar} style={styles.avatar} />
            )}
            <View style={styles.botMessageContent}>
              {showAvatar && (
                <Text style={styles.senderName}>{msg.user?.name}</Text>
              )}
              {/* Only show text if available */}
              {msg.text?.trim().length > 0 && (
                <View style={styles.botMessage}>
                  <Text style={styles.botMessageText}>{msg.text}</Text>
                </View>
              )}
              {/* Show suggestions if available */}
              {msg.suggestions && renderSuggestions(msg.suggestions)}
            </View>
          </View>
        )}

        {/* User Message */}
        {isUser && (
          <View style={styles.userMessageWrapper}>
            {showAvatar && (
              <View style={styles.userMessageHeader}>
                <Text style={styles.timestamp}>{msg.timestamp}</Text>
                <Text style={styles.senderName}>{msg.user?.name}</Text>
                <Image source={msg.user?.avatar} style={styles.avatar} />
              </View>
            )}

            {/* Only render text if it's not empty */}
            {(msg.text?.trim().length > 0 ||
              (msg.images && msg.images.length > 0)) && (
              <View style={styles.userMessage}>
                {msg.text?.trim().length > 0 && (
                  <Text style={styles.userMessageText}>{msg.text}</Text>
                )}
                {msg.images && msg.images.length > 0 && (
                  <View style={styles.imagesRow}>
                    {msg.images.map((img, i) => (
                      <Image
                        key={i}
                        source={img}
                        style={styles.uploadedImage}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // ---------- Render ----------
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image source={clinicInfo.image} style={styles.clinicImage} />
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
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
          <Ionicons
            name="camera-outline"
            size={24}
            color={colors.secondaryText}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color={colors.white} />
        </TouchableOpacity>
      </KeyboardAvoidingView>

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

// ---------- Helper to generate initial messages ----------
function getInitialMessages(
  chatType: 'ai' | 'doctor',
  doctorInfo: any,
): Message[] {
  const baseTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (chatType === 'doctor') {
    return [
      {
        id: '1',
        type: 'bot',
        text: 'Hello',
        timestamp: baseTime,
        user: { name: doctorInfo.name, avatar: doctor },
      },
      {
        id: '2',
        type: 'user',
        text: "I've been having some redness and small bumps on my cheeks for past few days.",
        timestamp: baseTime,
        user: { name: 'Bassil Kuncill Saadeh', avatar: patient },
      },
      {
        id: '3',
        type: 'bot',
        text: 'I recommend using a gentle cleanser and applying a hydrating cream twice daily...',
        timestamp: baseTime,
        user: { name: doctorInfo.name, avatar: doctor },
        suggestions: [
          {
            id: '1',
            image: PipsImage,
            type: 'Service',
            serviceGroup: 'Acne Treatment',
            serviceName: 'Advanced Facial',
            price: '350 SAR',
            duration: '45 min',
            description: 'A multi-step facial treatment.',
            procedure: 'Uses patented device.',
          },
          {
            id: '2',
            image: PipsImage,
            type: 'Device',
            serviceGroup: 'Wood lamp',
            serviceName: 'Diagnostic',
            price: '600 SAR',
            duration: '1 hr',
            description: 'Advanced diagnostic.',
            procedure: 'Device for skin analysis.',
          },
        ],
      },
    ];
  }

  // AI Chat
  return [
    { id: '1', type: 'user', text: 'Hi!', timestamp: baseTime },
    {
      id: '2',
      type: 'bot',
      text: 'Welcome! You can ask me anything or upload a photo to get suggestions.',
      timestamp: baseTime,
    },
    {
      id: '3',
      type: 'user',
      text: "I've uploaded a photo. I have some redness and itching on my face.",
      timestamp: baseTime,
      images: [pimples, pimples],
    },
    {
      id: '4',
      type: 'bot',
      text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
      timestamp: baseTime,
      suggestions: [
        {
          id: '1',
          image: PipsImage,
          type: 'Dermatology',
          serviceGroup: 'Skin Rejuvenation',
          serviceName: 'HydraFacial Glow',
          price: '350 SAR',
          duration: '45 min',
          description: 'Deep cleansing facial.',
          procedure: 'Uses a patented device.',
        },
        {
          id: '2',
          image: PipsImage,
          type: 'Dentistry',
          serviceGroup: 'Teeth Whitening',
          serviceName: 'Laser Smile Brightening',
          price: '600 SAR',
          duration: '1 hr',
          description: 'Advanced laser teeth whitening.',
          procedure: 'Hydrogen peroxide gel with laser.',
        },
      ],
    },
  ];
}
