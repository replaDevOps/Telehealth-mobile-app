import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
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
import { formatCurrency } from '@utils';
import { useAuthStore } from '@store';
import { navigateToProfileSetting } from '@navigation/navigation-service';
import { SheetToast } from './SheetToast';

/**
 * Android has no `onDismiss` on Modal, so the pending navigation is flushed on
 * a timer there instead. iOS drives it off the real dismiss callback.
 * Mirrors ConsultDoctorBottomSheet.
 */
const SHEET_DISMISS_MS = 400;

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
  totalLoyalityPoints?: string | number;
  devices?: any[];
  tags?: string[];
  campaignDiscount?: number | string;
  finalPrice?: number | string;
}

interface ServiceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  service: Service | null;
  onAddToCart: (service: Service) => void;
  onCheckout: (service: Service) => void;
  loading?: boolean;
  loadingState?: 'none' | 'adding_to_cart' | 'checking_out';
  /**
   * Error from the parent's add-to-cart / checkout call, rendered inline.
   *
   * The parent used to report these with Toast. This sheet is a native Modal -
   * a window above the React root - and toasts render inside that root
   * (ToastManager useModal={false}), so the message was drawn behind the sheet
   * and the user never saw why the action failed.
   */
  errorMessage?: string;
  /** Clears errorMessage once the in-sheet toast has dismissed itself. */
  onErrorShown?: () => void;
}

export const ServiceDetailBottomSheet: React.FC<ServiceDetailBottomSheetProps> = ({
  visible,
  onClose,
  service,
  onAddToCart,
  onCheckout,
  loading = false,
  loadingState = 'none',
  errorMessage = '',
  onErrorShown,
}) => {
  const { t, i18n } = useTranslation();
  const { isInCart } = useCart();
  const navigation = useNavigation();
  const [checkingProfileAdd, setCheckingProfileAdd] = useState(false);
  const [checkingProfileCheckout, setCheckingProfileCheckout] = useState(false);
  const signedOut = !useAuthStore(state => state.auth?.token);

  // Work that must not run until this Modal's native window is really gone.
  //
  // Two separate iOS problems, one cause. Navigating while the window is still
  // up strands it above the app, where it swallows every touch - the pushed
  // screen renders but nothing on it is tappable. And a toast fired from here
  // is drawn *behind* the sheet, because toasts render inline in the React
  // root (ToastManager useModal={false}) and zIndex cannot lift a view across
  // native windows. Deferring both until after dismissal fixes both.
  //
  // Flushing nulls the ref first, so a double flush is a no-op.
  const pendingActionRef = useRef<(() => void) | null>(null);

  const flushPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    if (!action) return;
    pendingActionRef.current = null;
    action();
  }, []);

  /** Closes the sheet, then runs `action` once it is off screen. */
  const closeThen = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      onClose();
      if (Platform.OS !== 'ios') {
        setTimeout(flushPendingAction, SHEET_DISMISS_MS);
      }
    },
    [onClose, flushPendingAction],
  );

  // Sends the guest to sign in once the sheet is gone. Returns true when it
  // took over, so the caller stops.
  const gateGuest = useCallback((): boolean => {
    if (!signedOut) return false;
    closeThen(() => navigation.navigate('Auth' as any, { screen: 'SignIn' }));
    return true;
  }, [signedOut, closeThen, navigation]);

  /** Incomplete profile: report and send them to fix it, after dismissal. */
  const sendToProfileSetting = useCallback(
    (msg: string) => {
      closeThen(() => {
        Toast.error(msg);
        navigateToProfileSetting();
      });
    },
    [closeThen],
  );

  // No `if (!visible) return null` here on purpose. Unmounting the component
  // tears the Modal out rather than dismissing it, so iOS never fires
  // onDismiss and the queued sign-in push would never flush. The Modal renders
  // nothing while visible is false, and the content below is already guarded
  // on `service`, so keeping it mounted costs nothing.

  const handleAddToCart = async () => {
    if (isAddDisabled || !service) return;
    // Before checkProfile, not after: checkProfile hits an authenticated
    // endpoint, so for a guest it 401s, which surfaced the backend's
    // "Unauthenticated" toast and then pushed them to ProfileSetting - while
    // the api-client interceptor logged them out on the way.
    if (gateGuest()) return;
    try {
      setCheckingProfileAdd(true);
      const result = await checkProfile();
      if (!result.ok) {
        sendToProfileSetting(
          result.message || t('please_complete_profile') || 'Please complete your profile before adding to cart',
        );
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
    if (gateGuest()) return;
    try {
      setCheckingProfileCheckout(true);
      const result = await checkProfile();
      if (!result.ok) {
        sendToProfileSetting(
          result.message || t('please_complete_profile') || 'Please complete your profile before checkout',
        );
        return;
      }
    } catch (err) {
      console.warn('checkProfile helper failed, proceeding with checkout:', err);
    } finally {
      setCheckingProfileCheckout(false);
    }

    onCheckout(service);
  };

  // Backed by the persisted ID set, so this stays true across a relaunch
  // instead of re-offering a service that is already in the cart.
  const serviceIsInCart = service ? isInCart(service.id) : false;
  const isAddingToCart = loadingState === 'adding_to_cart';
  const isCheckingOut = loadingState === 'checking_out';
  const isActionDisabled = loadingState !== 'none';
  const isAddDisabled = isActionDisabled || checkingProfileAdd || serviceIsInCart;
  const isCheckoutDisabled = isActionDisabled || checkingProfileCheckout;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={flushPendingAction}
    >
      <View style={styles.modalOverlay}>
        {/* Looks and behaves like the app toast, but lives in this Modal's
            window so it is actually visible. See SheetToast. */}
        <SheetToast message={errorMessage} onHide={() => onErrorShown?.()} />

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
                      {!!service.type && (
                        <View style={styles.tag}>
                          <Text style={styles.TypetagText} numberOfLines={1} ellipsizeMode="tail">{service.type.charAt(0).toUpperCase() + service.type.slice(1).toLowerCase()}</Text>
                        </View>
                      )}
                      {!!service.serviceGroup && (
                        <View style={styles.tag}>
                          <Text style={styles.SGtagText} numberOfLines={1} ellipsizeMode="tail">{service.serviceGroup.charAt(0).toUpperCase() + service.serviceGroup.slice(1).toLowerCase()}</Text>
                        </View>
                      )}
                    </View>
                    {(() => {
                      const isArabic = i18n.language?.startsWith('ar');
                      const disc = Number(service.campaignDiscount || 0);
                      const hasDiscount = disc > 0 && service.finalPrice !== undefined && service.finalPrice !== null;
                      const formattedPrice = formatCurrency(service.price, isArabic);
                      if (!hasDiscount) {
                        return <Text style={styles.price}>{formattedPrice}</Text>;
                      }
                      const discountLabel = isArabic ? `-${disc.toFixed(2)} ر.س` : `-SAR ${disc.toFixed(2)}`;
                      return (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.priceStrikethrough}>{formattedPrice}</Text>
                          <Text style={styles.price}>{formatCurrency(service.finalPrice, isArabic)}</Text>
                          <Text style={styles.discountText}>{discountLabel}</Text>
                        </View>
                      );
                    })()}
                  </View>

                  <View style={styles.serviceFooter}>
                    <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">{service.serviceName}</Text>
                    <View style={styles.durationContainer}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.duration}>
                        {service.duration ? (/min|m\b|hr|h\b/i.test(service.duration) ? service.duration : `${service.duration} min`) : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {(() => {
                  const pts = service.totalLoyalityPoints ?? service.bonusLoyalityPoints;
                  return pts && Number(pts) > 0 ? (
                    <Text style={styles.loyaltyBadgeText}>
                      {t('earn_points', { points: Math.round(Number(pts)) }) || `Earn ${Math.round(Number(pts))} loyalty points`}
                    </Text>
                  ) : null;
                })()}

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
                      {serviceIsInCart ? t('added_to_cart') || 'Added to Cart' : t('add_to_cart')}
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
  loyaltyBadge: {},
  loyaltyBadgeText: {
    marginTop: 8,
    fontSize: 12,
    color: '#CC9600',
    fontWeight: '600',
  },
  coinWrapper: {},
  coinImage: {},

  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  priceStrikethrough: {
    fontSize: 12,
    color: colors.secondaryText || '#888',
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
    textAlign: 'right',
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    paddingRight: 6,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  duration: {
    fontSize: 13,
    color: colors.secondaryText || '#666666',
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
