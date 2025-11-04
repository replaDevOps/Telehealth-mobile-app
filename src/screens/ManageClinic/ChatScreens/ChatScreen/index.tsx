import { doctor, patient, PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState, useRef, useEffect } from 'react';
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
import { colors } from '../../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ServiceDetailBottomSheet } from '@components/molecules';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { styles } from './style';

export default function ChatScreen({ navigation, route }) {
  // Get chat configuration from route params
  const chatType = route?.params?.chatType || 'ai'; // 'ai' or 'doctor'
  const doctorInfo = route?.params?.doctorInfo || {
    id: 'doctor_1',
    name: 'Dr. Sultan Khan',
    avatar: 'https://i.pravatar.cc/150?img=33',
  };
  const clinicInfo = route?.params?.clinicInfo || {
    name: 'Eden Medical Center',
    location: 'Makkah, Saudi Arabia, 2.2km',
    image: RecommandImage,
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  // 30-minute countdown timer (in seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor',
  );
  const [modalVisible, setModalVisible] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Initialize messages based on chat type
    const initialMessages = getInitialMessages();
    setMessages(initialMessages);
  }, [chatType]);

  useEffect(() => {
    if (!isConsultationActive || chatType !== 'doctor') return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsConsultationActive(false);
          setModalVisible(true); // auto end consultation when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConsultationActive, chatType]);

  const getInitialMessages = () => {
    if (chatType === 'doctor') {
      return [
        {
          id: '1',
          type: 'bot',
          text: 'Hello',
          timestamp: '3:20 PM',
          user: {
            name: doctorInfo.name,
            avatar: doctor,
          },
        },
        {
          id: '2',
          type: 'user',
          text: "I've been having some redness and small bumps on my cheeks for past few days.",
          timestamp: '3:20 PM',
          user: {
            name: 'Bassil Kuncill Saadeh',
            avatar: patient,
          },
        },
        {
          id: '3',
          type: 'bot',
          text: 'I recommend using a gentle cleanser and applying a hydrating cream twice daily. Also, avoid using any harsh exfoliators for a few days.',
          timestamp: '3:20 PM',
          user: {
            name: doctorInfo.name,
            avatar: doctor,
          },
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
    } else {
      return [
        {
          id: '1',
          type: 'user',
          text: 'Hi!',
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          id: '2',
          type: 'bot',
          text: "Welcome to [Clinic Name]! You can ask me anything or upload a photo. I'll suggest the best services and treatments available at this clinic.",
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          id: '3',
          type: 'user',
          text: "I've uploaded a photo. I have some redness and itching on my face.",
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          images: [
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
          ],
        },
        {
          id: '4',
          type: 'bot',
          text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          suggestions: [
            {
              id: '1',
              image: PipsImage,
              type: 'Dermatology',
              serviceGroup: 'Skin Rejuvenation',
              serviceName: 'HydraFacial Glow',
              price: '350 SAR',
              duration: '45 min',
              description:
                'A multi-step facial treatment that deeply cleanses.',
              procedure: 'Uses a patented device to cleanse.',
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
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleGetPrescription = () => {
    setModalVisible(false);
    console.log('User wants to get the prescription');
    navigation.navigate('PrescriptionScreen');
    // Navigate to prescription screen or trigger download
  };

  const handleServicePress = service => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: message,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        user:
          chatType === 'doctor'
            ? {
                name: 'Bassil Kuncill Saadeh',
                avatar: patient,
              }
            : undefined,
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleAddToCart = service => {
    console.log('Added to cart:', service);
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = service => {
    console.log('Checkout:', service);
    navigation.navigate('CheckoutScreen');
  };

  const handleEndConsultation = () => {
    setIsConsultationActive(false);
    setModalVisible(true);
  };

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const consultationTime = formatTime(remainingSeconds);

  const renderDoctorHeader = () => {
    return (
      <View style={styles.doctorHeaderContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.doctorHeaderCenter}>
          <Text style={styles.doctorName}>{doctorInfo.name}</Text>
          {isConsultationActive && (
            <Text style={styles.consultationTime}>{consultationTime}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConsultation}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.type === 'user';
    const showAvatar = chatType === 'doctor';

    return (
      <View key={msg.id || index} style={styles.messageContainer}>
        {/* Doctor/AI message with avatar */}
        {!isUser && showAvatar && (
          <View style={styles.botMessageWithAvatar}>
            <Image source={msg.user.avatar} style={styles.avatar} />
            <View style={styles.botMessageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>{msg.user?.name}</Text>
                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
              <View style={styles.botMessage}>
                <Text style={styles.botMessageText}>{msg.text}</Text>
              </View>
              {msg.suggestions && (
                <View style={styles.suggestionsContainer}>
                  {msg.suggestions.map((suggestion, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionCard}
                      onPress={() => handleServicePress(suggestion)}
                    >
                      <View style={styles.suggestionIcon}>
                        <Image
                          source={suggestion.image}
                          resizeMode="cover"
                          style={styles.suggestionImage}
                        />
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionTitle} numberOfLines={1}>
                          {suggestion.serviceGroup}
                        </Text>
                        <View style={styles.suggestionSubtitleRow}>
                          <Text
                            style={styles.suggestionSubtitle}
                            numberOfLines={1}
                          >
                            {suggestion.type}
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
              )}
            </View>
          </View>
        )}

        {/* AI message without avatar */}
        {!isUser && !showAvatar && (
          <View style={styles.botMessageWrapper}>
            <View style={styles.botMessage}>
              <Text style={styles.botMessageText}>{msg.text}</Text>
            </View>
            {msg.suggestions && (
              <View style={styles.suggestionsContainer}>
                {msg.suggestions.map((suggestion, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionCard}
                    onPress={() => handleServicePress(suggestion)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Image
                        source={suggestion.image}
                        resizeMode="cover"
                        style={styles.suggestionImage}
                      />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {suggestion.serviceGroup}
                      </Text>
                      <View style={styles.suggestionSubtitleRow}>
                        <Text
                          style={styles.suggestionSubtitle}
                          numberOfLines={1}
                        >
                          {suggestion.serviceName}
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
            )}
          </View>
        )}

        {/* User message */}
        {isUser && (
          <View style={styles.userMessageWrapper}>
            {showAvatar && (
              <View style={styles.userMessageHeader}>
                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Text>
                <Text style={styles.senderName}>{msg.user?.name}</Text>
                <Image source={msg.user?.avatar} style={styles.avatar} />
              </View>
            )}
            <View style={styles.userMessageRow}>
              <View style={styles.userMessage}>
                <Text style={styles.userMessageText}>{msg.text}</Text>
                {msg.images && (
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
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {chatType === 'ai' ? (
        <Header2 title="chat" showCart={true} logo={true} />
      ) : (
        renderDoctorHeader()
      )}
      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image
            source={clinicInfo.image}
            resizeMode="cover"
            style={styles.clinicImage}
          />
          <View>
            <Text style={styles.clinicName}>{clinicInfo.name}</Text>
            <Text style={styles.clinicLocation}>{clinicInfo.location}</Text>
          </View>
        </View>
        {chatType === 'doctor' ? (
          <TouchableOpacity style={styles.visitButton}>
            <Text style={styles.visitButtonText}>Visit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.consultButton}>
            <Text style={styles.consultButtonText}>Consult Now</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
      </ScrollView>
      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.cameraButton}>
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
      <ServiceDetailBottomSheet
        visible={serviceDetailVisible}
        onClose={() => setServiceDetailVisible(false)}
        service={selectedService}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
      />
      <ConsultationEndedModal
        visible={modalVisible}
        onClose={handleClose}
        onGetPrescription={handleGetPrescription}
      />
    </SafeAreaView>
  );
}
