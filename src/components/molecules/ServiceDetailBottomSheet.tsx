import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { coinIcon } from '@assets/images';
import { LoyaltyPSvg } from '@assets/icons';
import { ActivityIndicator } from 'react-native-paper';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import { checkProfile } from '@utils/checkProfile';

interface Service {
  id: string;
  image: any;
  type: string;
  serviceGroup: string;
  serviceName: string;
  price: string;
  duration: string;
  description?: string;
  procedure?: string;
  loyality?: boolean;
  bonusLoyalityPoints?: string;
  devices?: any[];
  tags?: string[];
}

interface ServiceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  service: Service | null;
  onAddToCart: (service: Service) => void;
  onCheckout: (service: Service) => void;
  loading?: boolean;
  loadingState?: 'none' | 'adding_to_cart' | 'checking_out';
}

export const ServiceDetailBottomSheet: React.FC<ServiceDetailBottomSheetProps> = ({
  visible,
  onClose,
  service,
  onAddToCart,
  onCheckout,
  loading = false,
  loadingState = 'none',
}) => {
  const { t } = useTranslation();
  const { cartItems } = useCart();
  const navigation = useNavigation();
  const [checkingProfileAdd, setCheckingProfileAdd] = useState(false);
  const [checkingProfileCheckout, setCheckingProfileCheckout] = useState(false);

  if (!visible) return null;

  

  const handleAddToCart = async () => {
    if (isAddDisabled || !service) return;
    try {
      setCheckingProfileAdd(true);
      const result = await checkProfile();
      if (!result.ok) {
        const msg = result.message || t('please_complete_profile') || 'Please complete your profile before adding to cart';
        Toast.error(msg);
        try {
          const { navigateToProfileSetting } = require('@navigation/root-navigation');
          navigateToProfileSetting();
        } catch (e) {
          navigation.navigate('Setting' as any, { screen: 'ProfileSetting' });
        }
        return;
      }
    } catch (err) {
      console.warn('checkProfile helper failed, proceeding with add to cart:', err);
    } finally {
      setCheckingProfileAdd(false);
    }

    onAddToCart(service);
  };

  const handleCheckout = async () => {
    if (isCheckoutDisabled || !service) return;
    try {
      setCheckingProfileCheckout(true);
      const result = await checkProfile();
      if (!result.ok) {
        const msg = result.message || t('please_complete_profile') || 'Please complete your profile before checkout';
        Toast.error(msg);
        try {
          const { navigateToProfileSetting } = require('@navigation/root-navigation');
          navigateToProfileSetting();
        } catch (e) {
          navigation.navigate('Setting' as any, { screen: 'ProfileSetting' });
        }
        return;
      }
    } catch (err) {
      console.warn('checkProfile helper failed, proceeding with checkout:', err);
    } finally {
      setCheckingProfileCheckout(false);
    }

    onCheckout(service);
  };

  const isInCart = service ? cartItems.some(item => item.service.id === service.id) : false;
  const isAddingToCart = loadingState === 'adding_to_cart';
  const isCheckingOut = loadingState === 'checking_out';
  const isActionDisabled = loadingState !== 'none';
  const isAddDisabled = isActionDisabled || checkingProfileAdd || isInCart;
  const isCheckoutDisabled = isActionDisabled || checkingProfileCheckout;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheetContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
            </View>
          ) : service ? (
            <>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Service Image */}
                <Image source={service.image} style={styles.serviceImage} />

                {/* Service Tags */}
                <View style={styles.serviceInfoContainter}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceTags}>
                      <View style={styles.tag}>
                        <Text style={styles.TypetagText} numberOfLines={1} ellipsizeMode="tail">{service.type}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.SGtagText} numberOfLines={1} ellipsizeMode="tail">{service.serviceGroup}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>{service.price}</Text>
                  </View>

                  <View style={styles.serviceFooter}>
                    <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">{service.serviceName}</Text>
                    <View style={styles.durationContainer}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.duration}>{service.duration}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 20 }}>
                  {service.loyality && service.bonusLoyalityPoints && Number(service.bonusLoyalityPoints) > 0 && (
                    <View style={styles.loyaltyBadge}>
                      <LoyaltyPSvg width={16} height={16} />
                      <Text style={styles.loyaltyBadgeText}>{t('earn_points', { points: service.bonusLoyalityPoints }) || `Earn ${service.bonusLoyalityPoints} loyalty points`}</Text>
                    </View>
                  )}
                </View>

                {/* Description Section */}
                {service.description && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('description')}</Text>
                    <Text style={styles.sectionText}>
                      {service.description || t('injectable_material_text')}
                    </Text>
                  </View>
                )}

                {/* Procedure Section */}
                {service.procedure && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('procedure')}</Text>
                    <Text style={styles.sectionText}>
                      {service.procedure || t('injected_under_skin_text')}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Footer Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    isAddDisabled && styles.addToCartButtonDisabled
                  ]}
                  onPress={handleAddToCart}
                  activeOpacity={0.7}
                  disabled={isAddDisabled}
                >
                  {(isAddingToCart || checkingProfileAdd) ? (
                    <ActivityIndicator size="small" color={colors.black} />
                  ) : (
                    <Text style={styles.addToCartText}>
                      {isInCart ? t('added_to_cart') || 'Added to Cart' : t('add_to_cart')}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkoutButton,
                    isCheckoutDisabled && styles.addToCartButtonDisabled
                  ]}
                  onPress={handleCheckout}
                  activeOpacity={0.7}
                  disabled={isCheckoutDisabled}
                >
                  {(isCheckingOut || checkingProfileCheckout) ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.checkoutText}>{t('checkout') || 'Checkout'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('no_service_selected') || 'No service selected'}</Text>
            </View>
          )}
        </View>
      </View>
        {/* (removed) full-screen loader — using button-level loaders for profile check */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  serviceImage: {
    width: '50%',
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  loyaltyBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loyaltyBadgeText: {
    fontSize: 12,
    color: '#7A4B00',
    marginLeft: 6,
    fontWeight: '500',
  },

  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  duration: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 20,
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  checkoutButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  serviceInfoContainter: {
    flex: 1,
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
  },
  TypetagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    flexShrink: 1,
  },
  SGtagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    flexShrink: 1,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondaryText,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  profileCheckingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default ServiceDetailBottomSheet;
