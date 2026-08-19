import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';

import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { deleteSavedCard, getSavedCards } from '@services/payments/hyperpayService';
import type { SavedCard } from '../../../types/payment.types';

export const SavedCardsScreen = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedCards();
      setCards(data || []);
    } catch (e) {
      console.warn('[SavedCardsScreen] Failed to load cards:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [fetchCards]),
  );

  const handleDeleteCard = (cardId: number) => {
    Alert.alert(
      t('delete_card_title') || 'Delete Payment Method',
      t('delete_card_confirm') || 'Are you sure you want to delete this saved card?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingId(cardId);
            try {
              await deleteSavedCard(cardId);
              Toast.success(t('card_deleted') || 'Card deleted successfully');
              fetchCards();
            } catch (e: any) {
              console.error('[SavedCardsScreen] Delete card failed:', e);
              Toast.error(e?.message || t('failed_to_delete_card') || 'Failed to delete card');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderCardItem = ({ item }: { item: SavedCard }) => {
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.cardItem}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="card-outline" size={24} color={colors.primary} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardBrand}>
            {item.brand?.toUpperCase()} •••• {item.last_four}
          </Text>
          <Text style={styles.cardExpiry}>
            {t('expires') || 'Expires'} {item.expiry_month}/{item.expiry_year}
            {item.is_default ? ` • ${t('default') || 'Default'}` : ''}
          </Text>
        </View>

        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.red} />
        ) : (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteCard(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header2 title={t('payment_methods') || 'Payment Methods'} />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>
              {t('no_saved_cards') || 'No Saved Payment Methods'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('no_saved_cards_desc') ||
                'Your saved payment cards will appear here after you save them during checkout.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={cards}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCardItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F5EEFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },
  deleteBtn: {
    padding: 6,
  },
});
