import React from 'react';
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
}

interface ServiceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  service: Service | null;
  onAddToCart: (service: Service) => void;
  onCheckout: (service: Service) => void;
}

export const ServiceDetailBottomSheet: React.FC<
  ServiceDetailBottomSheetProps
> = ({ visible, onClose, service, onAddToCart, onCheckout }) => {
  if (!service) return null;

  const handleAddToCart = () => {
    onAddToCart(service);
  };

  const handleCheckout = () => {
    onCheckout(service);
    onClose();
  };

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
                    <Text style={styles.TypetagText}>{service.type}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.SGtagText}>{service.serviceGroup}</Text>
                  </View>
                </View>
                <Text style={styles.price}>{service.price}</Text>
              </View>

              <View style={styles.serviceFooter}>
                <Text style={styles.serviceName}>{service.serviceName}</Text>
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

            {/* Description Section */}
            {service.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>
                  {service.description ||
                    'Injectable material used to improve the appearance of fine lines and wrinkles. Injectable material used to improve the appearance of fine lines and wrinkles Injectable material used to improve the appearance of fine lines and wrinkles.'}
                </Text>
              </View>
            )}

            {/* Procedure Section */}
            {service.procedure && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Procedure</Text>
                <Text style={styles.sectionText}>
                  {service.procedure ||
                    'Injected under the skin using a fine needle.'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.7}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
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
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
  },
  TypetagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  SGtagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ServiceDetailBottomSheet;
