import { PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Add this import for FontAwesome5
import { ServiceDetailBottomSheet } from '@components/molecules';

export default function ChatScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'user',
      text: 'Hi!',
    },
    {
      type: 'bot',
      text: "Welcome to [Clinic Name]! You can ask me anything or upload a photo. I'll suggest the best services and treatments available at this clinic.",
    },
    {
      type: 'user',
      text: "I've uploaded a photo. I have some redness and itching on my face.",
      images: [
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
      ],
    },
    {
      type: 'bot',
      text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
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
            'A multi-step facial treatment that deeply cleanses, exfoliates, and hydrates the skin, leaving it refreshed and glowing.',
          procedure:
            'The procedure uses a patented device to cleanse and infuse serums into the skin for maximum hydration and brightness.',
        },
        {
          id: '2',
          image: PipsImage,
          type: 'Dentistry',
          serviceGroup: 'Teeth Whitening',
          serviceName: 'Laser Smile Brightening',
          price: '600 SAR',
          duration: '1 hr',
          description:
            'Advanced laser teeth whitening procedure designed to safely and effectively brighten your smile up to 8 shades.',
          procedure:
            'A hydrogen peroxide gel is applied and activated with laser light to remove deep-set stains.',
        },
      ],
    },
  ]);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServicePress = service => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { type: 'user', text: message }]);
      setMessage('');
    }
  };

  const handleAddToCart = service => {
    console.log('Added to cart:', service);
    // Add to cart logic
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = service => {
    console.log('Checkout:', service);
    // Navigate to checkout
    navigation.navigate('CheckoutScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <Header2 title="chat" showCart={true} logo={true} />
      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image
            source={RecommandImage}
            resizeMode="cover"
            style={styles.clinicImage}
          />
          <View>
            <Text style={styles.clinicName}>Eden Medical Center</Text>
            <Text style={styles.clinicLocation}>
              Makkah, Saudi Arabia, 2.2km
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.consultButton}>
          <Text style={styles.consultButtonText}>Consult Now</Text>
        </TouchableOpacity>
      </View>
      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={
              msg.type === 'user'
                ? styles.userMessageWrapper
                : styles.botMessageWrapper
            }
          >
            {msg.type === 'user' ? (
              <View style={styles.userMessage}>
                <Text style={styles.userMessageText}>{msg.text}</Text>
                {msg.images && (
                  <View style={styles.imagesRow}>
                    {msg.images.map((img, i) => (
                      <Image
                        key={i}
                        source={{ uri: img }}
                        style={styles.uploadedImage}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.botMessage}>
                <Text style={styles.botMessageText}>{msg.text}</Text>
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
                            style={styles.clinicImage}
                          />
                        </View>
                        <View style={styles.suggestionContent}>
                          <Text
                            style={styles.suggestionTitle}
                            numberOfLines={1}
                          >
                            {suggestion.serviceGroup}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Text
                              style={styles.suggestionSubtitle}
                              numberOfLines={1}
                            >
                              {suggestion.serviceName}
                            </Text>
                            <FontAwesome5
                              name="external-link-alt"
                              size={15}
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
          </View>
        ))}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  heartIcon: {
    fontSize: 28,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
  },
  clinicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clinicImage: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicEmoji: {
    fontSize: 24,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  clinicLocation: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  consultButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessage: {
    padding: 12,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 10,
  },
  imagesRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
    justifyContent: 'flex-end',
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  botMessage: {
    maxWidth: '85%',
  },
  botMessageText: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  suggestionCard: {
    width: '48%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionEmoji: {
    fontSize: 20,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  suggestionSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    width: '80%',
    overflow: 'hidden',
  },
  suggestionArrow: {
    fontSize: 18,
    color: '#7c3aed',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 5,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraIcon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
    borderColor: colors.border,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#7c3aed',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 16,
  },
});
