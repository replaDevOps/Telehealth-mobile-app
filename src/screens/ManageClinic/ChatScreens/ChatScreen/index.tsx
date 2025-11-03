// import { PipsImage, RecommandImage } from '@assets/images';
// import { Header2 } from '@components/common/Header2';
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   StyleSheet,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { colors } from '../../../../styles/colors';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Add this import for FontAwesome5
// import { ServiceDetailBottomSheet } from '@components/molecules';

// export default function ChatScreen({ navigation }) {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([
//     {
//       type: 'user',
//       text: 'Hi!',
//     },
//     {
//       type: 'bot',
//       text: "Welcome to [Clinic Name]! You can ask me anything or upload a photo. I'll suggest the best services and treatments available at this clinic.",
//     },
//     {
//       type: 'user',
//       text: "I've uploaded a photo. I have some redness and itching on my face.",
//       images: [
//         'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
//       ],
//     },
//     {
//       type: 'bot',
//       text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
//       suggestions: [
//         {
//           id: '1',
//           image: PipsImage,
//           type: 'Dermatology',
//           serviceGroup: 'Skin Rejuvenation',
//           serviceName: 'HydraFacial Glow',
//           price: '350 SAR',
//           duration: '45 min',
//           description:
//             'A multi-step facial treatment that deeply cleanses, exfoliates, and hydrates the skin, leaving it refreshed and glowing.',
//           procedure:
//             'The procedure uses a patented device to cleanse and infuse serums into the skin for maximum hydration and brightness.',
//         },
//         {
//           id: '2',
//           image: PipsImage,
//           type: 'Dentistry',
//           serviceGroup: 'Teeth Whitening',
//           serviceName: 'Laser Smile Brightening',
//           price: '600 SAR',
//           duration: '1 hr',
//           description:
//             'Advanced laser teeth whitening procedure designed to safely and effectively brighten your smile up to 8 shades.',
//           procedure:
//             'A hydrogen peroxide gel is applied and activated with laser light to remove deep-set stains.',
//         },
//       ],
//     },
//   ]);
//   const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
//   const [selectedService, setSelectedService] = useState(null);

//   const handleServicePress = service => {
//     setSelectedService(service);
//     setServiceDetailVisible(true);
//   };

//   const handleSend = () => {
//     if (message.trim()) {
//       setMessages([...messages, { type: 'user', text: message }]);
//       setMessage('');
//     }
//   };

//   const handleAddToCart = service => {
//     console.log('Added to cart:', service);
//     // Add to cart logic
//     setServiceDetailVisible(false);
//     navigation.navigate('CartScreen');
//   };

//   const handleCheckout = service => {
//     console.log('Checkout:', service);
//     // Navigate to checkout
//     navigation.navigate('CheckoutScreen');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       {/* Header */}
//       <Header2 title="chat" showCart={true} logo={true} />
//       {/* Clinic Info */}
//       <View style={styles.clinicInfo}>
//         <View style={styles.clinicLeft}>
//           <Image
//             source={RecommandImage}
//             resizeMode="cover"
//             style={styles.clinicImage}
//           />
//           <View>
//             <Text style={styles.clinicName}>Eden Medical Center</Text>
//             <Text style={styles.clinicLocation}>
//               Makkah, Saudi Arabia, 2.2km
//             </Text>
//           </View>
//         </View>
//         <TouchableOpacity style={styles.consultButton}>
//           <Text style={styles.consultButtonText}>Consult Now</Text>
//         </TouchableOpacity>
//       </View>
//       {/* Messages */}
//       <ScrollView
//         style={styles.messagesContainer}
//         contentContainerStyle={styles.messagesContent}
//       >
//         {messages.map((msg, index) => (
//           <View
//             key={index}
//             style={
//               msg.type === 'user'
//                 ? styles.userMessageWrapper
//                 : styles.botMessageWrapper
//             }
//           >
//             {msg.type === 'user' ? (
//               <View style={styles.userMessage}>
//                 <Text style={styles.userMessageText}>{msg.text}</Text>
//                 {msg.images && (
//                   <View style={styles.imagesRow}>
//                     {msg.images.map((img, i) => (
//                       <Image
//                         key={i}
//                         source={{ uri: img }}
//                         style={styles.uploadedImage}
//                       />
//                     ))}
//                   </View>
//                 )}
//               </View>
//             ) : (
//               <View style={styles.botMessage}>
//                 <Text style={styles.botMessageText}>{msg.text}</Text>
//                 {msg.suggestions && (
//                   <View style={styles.suggestionsContainer}>
//                     {msg.suggestions.map((suggestion, i) => (
//                       <TouchableOpacity
//                         key={i}
//                         style={styles.suggestionCard}
//                         onPress={() => handleServicePress(suggestion)}
//                       >
//                         <View style={styles.suggestionIcon}>
//                           <Image
//                             source={suggestion.image}
//                             resizeMode="cover"
//                             style={styles.clinicImage}
//                           />
//                         </View>
//                         <View style={styles.suggestionContent}>
//                           <Text
//                             style={styles.suggestionTitle}
//                             numberOfLines={1}
//                           >
//                             {suggestion.serviceGroup}
//                           </Text>
//                           <View
//                             style={{
//                               flexDirection: 'row',
//                               alignItems: 'center',
//                               gap: 4,
//                             }}
//                           >
//                             <Text
//                               style={styles.suggestionSubtitle}
//                               numberOfLines={1}
//                             >
//                               {suggestion.serviceName}
//                             </Text>
//                             <FontAwesome5
//                               name="external-link-alt"
//                               size={15}
//                               color={colors.primary}
//                             />
//                           </View>
//                         </View>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//         ))}
//       </ScrollView>
//       {/* Input Bar */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.inputContainer}
//       >
//         <TouchableOpacity style={styles.cameraButton}>
//           <Ionicons
//             name="camera-outline"
//             size={24}
//             color={colors.secondaryText}
//           />
//         </TouchableOpacity>
//         <TextInput
//           style={styles.input}
//           placeholder="Message"
//           value={message}
//           onChangeText={setMessage}
//           onSubmitEditing={handleSend}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//           <Ionicons name="send" size={24} color={colors.white} />
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
//       <ServiceDetailBottomSheet
//         visible={serviceDetailVisible}
//         onClose={() => setServiceDetailVisible(false)}
//         service={selectedService}
//         onAddToCart={handleAddToCart}
//         onCheckout={handleCheckout}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   backButton: {
//     padding: 8,
//   },
//   backIcon: {
//     fontSize: 24,
//     color: '#000',
//   },
//   heartIcon: {
//     fontSize: 28,
//   },
//   cartButton: {
//     padding: 8,
//     position: 'relative',
//   },
//   cartIcon: {
//     fontSize: 24,
//   },
//   badge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: '#7c3aed',
//     borderRadius: 10,
//     width: 18,
//     height: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   badgeText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   clinicInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 12,
//     borderBottomWidth: 1,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     borderBottomColor: colors.border,
//   },
//   clinicLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   clinicImage: {
//     width: 48,
//     height: 48,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   clinicEmoji: {
//     fontSize: 24,
//   },
//   clinicName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   clinicLocation: {
//     fontSize: 11,
//     color: '#6b7280',
//     marginTop: 2,
//   },
//   consultButton: {
//     backgroundColor: colors.black,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 4,
//   },
//   consultButtonText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   messagesContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   messagesContent: {
//     padding: 16,
//   },
//   userMessageWrapper: {
//     alignItems: 'flex-end',
//     marginBottom: 16,
//   },
//   userMessage: {
//     padding: 12,
//     maxWidth: '80%',
//   },
//   userMessageText: {
//     fontSize: 15,
//     color: colors.text,
//     backgroundColor: colors.lightGray,
//     padding: 12,
//     borderRadius: 10,
//   },
//   imagesRow: {
//     flexDirection: 'row',
//     marginTop: 8,
//     gap: 8,
//     justifyContent: 'flex-end',
//   },
//   uploadedImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   botMessageWrapper: {
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   botMessage: {
//     maxWidth: '85%',
//   },
//   botMessageText: {
//     backgroundColor: colors.primary,
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 15,
//     color: '#fff',
//     lineHeight: 20,
//   },
//   suggestionsContainer: {
//     marginTop: 12,
//     gap: 8,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     width: '100%',
//   },
//   suggestionCard: {
//     width: '48%',
//     height: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.lightGray,
//     padding: 12,
//   },
//   suggestionIcon: {
//     width: 40,
//     height: 40,
//     backgroundColor: '#fef3c7',
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   suggestionEmoji: {
//     fontSize: 20,
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   suggestionSubtitle: {
//     fontSize: 10,
//     color: '#6b7280',
//     marginTop: 2,
//     width: '80%',
//     overflow: 'hidden',
//   },
//   suggestionArrow: {
//     fontSize: 18,
//     color: '#7c3aed',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     gap: 5,
//   },
//   cameraButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.gray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   cameraIcon: {
//     fontSize: 24,
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#f3f4f6',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 15,
//     marginRight: 8,
//     borderColor: colors.border,
//     borderWidth: 1,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     backgroundColor: '#7c3aed',
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sendIcon: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// import { PipsImage, RecommandImage } from '@assets/images';
// import { Header2 } from '@components/common/Header2';
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   StatusBar,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   GiftedChat,
//   Bubble,
//   InputToolbar,
//   Send,
//   Avatar,
//   Time,
// } from 'react-native-gifted-chat';
// import { colors } from '../../../../styles/colors';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import { ServiceDetailBottomSheet } from '@components/molecules';

// export default function ChatScreen({ navigation, route }) {
//   // Get chat configuration from route params
//   const chatType = route?.params?.chatType || 'ai'; // 'ai' or 'doctor'
//   const doctorInfo = route?.params?.doctorInfo || {
//     id: 'doctor_1',
//     name: 'Dr. Sultan Khan',
//     avatar: 'https://i.pravatar.cc/150?img=12',
//   };
//   const clinicInfo = route?.params?.clinicInfo || {
//     name: 'Eden Medical Center',
//     location: 'Makkah, Saudi Arabia, 2.2km',
//     image: RecommandImage,
//   };

//   const [messages, setMessages] = useState([]);
//   const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
//   const [selectedService, setSelectedService] = useState(null);
//   const [consultationTime, setConsultationTime] = useState('01:00');
//   const [isConsultationActive, setIsConsultationActive] = useState(
//     chatType === 'doctor',
//   );

//   useEffect(() => {
//     // Initialize messages based on chat type
//     const initialMessages = getInitialMessages();
//     setMessages(initialMessages);
//   }, [chatType]);

//   const getInitialMessages = () => {
//     const botUser = {
//       _id: chatType === 'doctor' ? doctorInfo.id : 'ai_assistant',
//       name: chatType === 'doctor' ? doctorInfo.name : 'AI Assistant',
//       avatar: chatType === 'doctor' ? doctorInfo.avatar : RecommandImage,
//     };

//     const currentUser = {
//       _id: 'current_user',
//       name: 'Bassil Kuncill Saadeh',
//       avatar: 'https://i.pravatar.cc/150?img=33',
//     };

//     if (chatType === 'doctor') {
//       return [
//         {
//           _id: 4,
//           text: 'I recommend using a gentle cleanser and applying a hydrating cream twice daily. Also, avoid using any harsh exfoliators for a few days.',
//           createdAt: new Date(Date.now() - 30000),
//           user: botUser,
//           suggestions: [
//             {
//               id: '1',
//               image: PipsImage,
//               type: 'Service',
//               serviceGroup: 'Acne Treatment',
//               serviceName: 'Advanced Facial',
//               price: '350 SAR',
//               duration: '45 min',
//               description:
//                 'A multi-step facial treatment that deeply cleanses.',
//               procedure: 'The procedure uses a patented device.',
//             },
//             {
//               id: '2',
//               image: PipsImage,
//               type: 'Device',
//               serviceGroup: 'Wood lamp',
//               serviceName: 'Diagnostic Device',
//               price: '600 SAR',
//               duration: '1 hr',
//               description: 'Advanced diagnostic procedure.',
//               procedure: 'Device used for skin analysis.',
//             },
//           ],
//         },
//         {
//           _id: 3,
//           text: "I've been having some redness and small bumps on my cheeks for past few days.",
//           createdAt: new Date(Date.now() - 120000),
//           user: currentUser,
//         },
//         {
//           _id: 2,
//           text: 'Hello',
//           createdAt: new Date(Date.now() - 180000),
//           user: botUser,
//         },
//       ];
//     } else {
//       return [
//         {
//           _id: 4,
//           text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
//           createdAt: new Date(Date.now() - 30000),
//           user: botUser,
//           suggestions: [
//             {
//               id: '1',
//               image: PipsImage,
//               type: 'Dermatology',
//               serviceGroup: 'Skin Rejuvenation',
//               serviceName: 'HydraFacial Glow',
//               price: '350 SAR',
//               duration: '45 min',
//               description:
//                 'A multi-step facial treatment that deeply cleanses, exfoliates, and hydrates the skin.',
//               procedure:
//                 'The procedure uses a patented device to cleanse and infuse serums into the skin.',
//             },
//             {
//               id: '2',
//               image: PipsImage,
//               type: 'Dentistry',
//               serviceGroup: 'Teeth Whitening',
//               serviceName: 'Laser Smile Brightening',
//               price: '600 SAR',
//               duration: '1 hr',
//               description: 'Advanced laser teeth whitening procedure.',
//               procedure:
//                 'A hydrogen peroxide gel is applied and activated with laser light.',
//             },
//           ],
//         },
//         {
//           _id: 3,
//           text: "I've uploaded a photo. I have some redness and itching on my face.",
//           createdAt: new Date(Date.now() - 120000),
//           user: currentUser,
//           image:
//             'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
//           images: [
//             'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
//             'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
//           ],
//         },
//         {
//           _id: 2,
//           text: "Welcome to [Clinic Name]! You can ask me anything or upload a photo. I'll suggest the best services and treatments available at this clinic.",
//           createdAt: new Date(Date.now() - 180000),
//           user: botUser,
//         },
//         {
//           _id: 1,
//           text: 'Hi!',
//           createdAt: new Date(Date.now() - 240000),
//           user: currentUser,
//         },
//       ];
//     }
//   };

//   const onSend = useCallback((newMessages = []) => {
//     setMessages(previousMessages =>
//       GiftedChat.append(previousMessages, newMessages),
//     );
//   }, []);

//   const handleServicePress = service => {
//     setSelectedService(service);
//     setServiceDetailVisible(true);
//   };

//   const handleAddToCart = service => {
//     console.log('Added to cart:', service);
//     setServiceDetailVisible(false);
//     navigation.navigate('CartScreen');
//   };

//   const handleCheckout = service => {
//     console.log('Checkout:', service);
//     navigation.navigate('CheckoutScreen');
//   };

//   const handleEndConsultation = () => {
//     setIsConsultationActive(false);
//     // Show confirmation dialog or navigate back
//     navigation.goBack();
//   };

//   const renderBubble = props => {
//     return (
//       <View>
//         <Bubble
//           {...props}
//           wrapperStyle={{
//             left: {
//               backgroundColor: colors.primary,
//               borderRadius: 10,
//               padding: 4,
//               marginLeft: 8,
//             },
//             right: {
//               backgroundColor: colors.lightGray,
//               borderRadius: 10,
//               padding: 4,
//               marginRight: 8,
//             },
//           }}
//           textStyle={{
//             left: {
//               color: colors.white,
//               fontSize: 15,
//             },
//             right: {
//               color: colors.text,
//               fontSize: 15,
//             },
//           }}
//         />

//         {/* Render uploaded images */}
//         {props.currentMessage.images && (
//           <View
//             style={[
//               styles.imagesRow,
//               props.currentMessage.user._id === 'current_user' &&
//                 styles.imagesRowRight,
//             ]}
//           >
//             {props.currentMessage.images.map((img, i) => (
//               <Image
//                 key={i}
//                 source={{ uri: img }}
//                 style={styles.uploadedImage}
//               />
//             ))}
//           </View>
//         )}

//         {/* Render service suggestions */}
//         {props.currentMessage.suggestions && (
//           <View style={styles.suggestionsContainer}>
//             {props.currentMessage.suggestions.map((suggestion, i) => (
//               <TouchableOpacity
//                 key={i}
//                 style={styles.suggestionCard}
//                 onPress={() => handleServicePress(suggestion)}
//               >
//                 <View style={styles.suggestionIcon}>
//                   <Image
//                     source={suggestion.image}
//                     resizeMode="cover"
//                     style={styles.suggestionImage}
//                   />
//                 </View>
//                 <View style={styles.suggestionContent}>
//                   <Text style={styles.suggestionTitle} numberOfLines={1}>
//                     {suggestion.serviceGroup}
//                   </Text>
//                   <View style={styles.suggestionSubtitleRow}>
//                     <Text style={styles.suggestionSubtitle} numberOfLines={1}>
//                       {suggestion.type}
//                     </Text>
//                     <FontAwesome5
//                       name="external-link-alt"
//                       size={12}
//                       color={colors.primary}
//                     />
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderInputToolbar = props => {
//     return (
//       <InputToolbar
//         {...props}
//         containerStyle={styles.inputToolbarContainer}
//         primaryStyle={styles.inputToolbarPrimary}
//         renderActions={() => (
//           <TouchableOpacity style={styles.cameraButton}>
//             <Ionicons
//               name="camera-outline"
//               size={24}
//               color={colors.secondaryText}
//             />
//           </TouchableOpacity>
//         )}
//       />
//     );
//   };

//   const renderSend = props => {
//     return (
//       <Send {...props} containerStyle={styles.sendContainer}>
//         <View style={styles.sendButton}>
//           <Ionicons name="send" size={20} color={colors.white} />
//         </View>
//       </Send>
//     );
//   };

//   const renderAvatar = props => {
//     if (chatType !== 'doctor') return null;

//     return (
//       <Avatar
//         {...props}
//         imageStyle={{
//           left: styles.avatar,
//           right: styles.avatar,
//         }}
//       />
//     );
//   };

//   const renderTime = props => {
//     return (
//       <Time
//         {...props}
//         timeTextStyle={{
//           left: styles.timeLeft,
//           right: styles.timeRight,
//         }}
//       />
//     );
//   };

//   const renderDoctorHeader = () => {
//     if (chatType !== 'doctor') return null;

//     return (
//       <View style={styles.doctorHeaderContainer}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={24} color={colors.text} />
//         </TouchableOpacity>
//         <View style={styles.doctorHeaderCenter}>
//           <Text style={styles.doctorName}>{doctorInfo.name}</Text>
//           {isConsultationActive && (
//             <Text style={styles.consultationTime}>{consultationTime}</Text>
//           )}
//         </View>
//         {isConsultationActive && (
//           <TouchableOpacity
//             style={styles.endButton}
//             onPress={handleEndConsultation}
//           >
//             <Text style={styles.endButtonText}>End</Text>
//           </TouchableOpacity>
//         )}
//         {!isConsultationActive && <View style={styles.placeholder} />}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       {chatType === 'ai' ? (
//         <Header2 title="chat" showCart={true} logo={true} />
//       ) : (
//         renderDoctorHeader()
//       )}

//       {/* Clinic Info */}
//       <View style={styles.clinicInfo}>
//         <View style={styles.clinicLeft}>
//           <Image
//             source={clinicInfo.image}
//             resizeMode="cover"
//             style={styles.clinicImage}
//           />
//           <View>
//             <Text style={styles.clinicName}>{clinicInfo.name}</Text>
//             <Text style={styles.clinicLocation}>{clinicInfo.location}</Text>
//           </View>
//         </View>
//         {chatType === 'doctor' ? (
//           <TouchableOpacity style={styles.visitButton}>
//             <Text style={styles.visitButtonText}>Visit</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity style={styles.consultButton}>
//             <Text style={styles.consultButtonText}>Consult Now</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Chat Messages */}
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: 'current_user',
//           name: 'Bassil Kuncill Saadeh',
//           avatar: 'https://i.pravatar.cc/150?img=33',
//         }}
//         renderBubble={renderBubble}
//         renderInputToolbar={renderInputToolbar}
//         renderSend={renderSend}
//         renderAvatar={chatType === 'doctor' ? renderAvatar : null}
//         renderTime={renderTime}
//         renderUsernameOnMessage={chatType === 'doctor'}
//         alwaysShowSend
//         scrollToBottom
//         showUserAvatar={chatType === 'doctor'}
//         showAvatarForEveryMessage={chatType === 'doctor'}
//         renderAvatarOnTop
//         placeholder="Message"
//         textInputStyle={styles.textInput}
//         messagesContainerStyle={styles.messagesContainer}
//         listViewProps={{
//           showsVerticalScrollIndicator: false,
//         }}
//       />

//       {/* Service Detail Bottom Sheet */}
//       <ServiceDetailBottomSheet
//         visible={serviceDetailVisible}
//         onClose={() => setServiceDetailVisible(false)}
//         service={selectedService}
//         onAddToCart={handleAddToCart}
//         onCheckout={handleCheckout}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   doctorHeaderContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     backgroundColor: colors.white,
//   },
//   backButton: {
//     padding: 4,
//   },
//   doctorHeaderCenter: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   doctorName: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   consultationTime: {
//     fontSize: 13,
//     color: colors.secondaryText,
//     marginTop: 2,
//   },
//   endButton: {
//     backgroundColor: '#ef4444',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   endButtonText: {
//     color: colors.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   placeholder: {
//     width: 60,
//   },
//   clinicInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 12,
//     borderBottomWidth: 1,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     borderBottomColor: colors.border,
//     backgroundColor: colors.white,
//   },
//   clinicLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   clinicImage: {
//     width: 48,
//     height: 48,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 8,
//     marginRight: 12,
//   },
//   clinicName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   clinicLocation: {
//     fontSize: 11,
//     color: colors.secondaryText,
//     marginTop: 2,
//   },
//   consultButton: {
//     backgroundColor: colors.black,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 4,
//   },
//   consultButtonText: {
//     color: colors.white,
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   visitButton: {
//     backgroundColor: colors.lightGray,
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   visitButtonText: {
//     color: colors.text,
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   messagesContainer: {
//     backgroundColor: colors.white,
//   },
//   inputToolbarContainer: {
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     backgroundColor: colors.white,
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//   },
//   inputToolbarPrimary: {
//     alignItems: 'center',
//   },
//   cameraButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.gray,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginLeft: 4,
//     marginBottom: 4,
//   },
//   textInput: {
//     backgroundColor: colors.lightGray,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     paddingHorizontal: 12,
//     paddingTop: 8,
//     paddingBottom: 8,
//     marginLeft: 8,
//     marginRight: 8,
//     fontSize: 15,
//     color: colors.text,
//     lineHeight: 20,
//   },
//   sendContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 4,
//     marginBottom: 4,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     backgroundColor: colors.primary,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   timeLeft: {
//     color: colors.white,
//     fontSize: 11,
//   },
//   timeRight: {
//     color: colors.secondaryText,
//     fontSize: 11,
//   },
//   imagesRow: {
//     flexDirection: 'row',
//     marginTop: 8,
//     marginLeft: 12,
//     gap: 8,
//   },
//   imagesRowRight: {
//     justifyContent: 'flex-end',
//     marginRight: 12,
//     marginLeft: 0,
//   },
//   uploadedImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   suggestionsContainer: {
//     marginTop: 12,
//     marginHorizontal: 12,
//     gap: 8,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   suggestionCard: {
//     width: '48%',
//     minHeight: 70,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.lightGray,
//     padding: 12,
//     borderRadius: 8,
//   },
//   suggestionIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 40,
//     height: 40,
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: 4,
//   },
//   suggestionSubtitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   suggestionSubtitle: {
//     fontSize: 10,
//     color: colors.secondaryText,
//     flex: 1,
//   },
// });

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
  const [consultationTime, setConsultationTime] = useState('01:00');
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

  const formatTime = timestamp => {
    return timestamp;
  };

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
