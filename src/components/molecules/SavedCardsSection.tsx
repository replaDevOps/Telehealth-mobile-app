import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import type { SavedCard } from '../../types/payment.types';
import { CheckboxWithText } from '@components/common/CheckboxWithText';

interface SavedCardsSectionProps {
  cards: SavedCard[];
  selectedCardId: number | null;
  onSelectCard: (cardId: number | null) => void;
  saveCard: boolean;
  onSaveCardChange: (save: boolean) => void;
  onDeleteCard?: (cardId: number) => void;
  hideSaveCard?: boolean;
}

export function SavedCardsSection({
  cards,
  selectedCardId,
  onSelectCard,
  saveCard,
  onSaveCardChange,
  onDeleteCard,
  hideSaveCard = false,
}: SavedCardsSectionProps) {
  const { t } = useTranslation();

  if (!cards || cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>{t('one_time_payment')}</Text>
        <TouchableOpacity
          style={[styles.paymentOption, styles.paymentOptionSelected]}
          activeOpacity={0.8}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
            <Text style={styles.paymentLabel}>
              {t('card_mada_visa_master')}
            </Text>
          </View>
        </TouchableOpacity>

        {!hideSaveCard && (
          <View style={styles.saveCardRow}>
            <CheckboxWithText
              isChecked={saveCard}
              onToggle={() => onSaveCardChange(!saveCard)}
            >
              <Text style={styles.saveCardLabel}>
                {t('save_card_for_future') || 'Save this card for future payments'}
              </Text>
            </CheckboxWithText>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>
        {t('saved_cards') || 'Saved Cards'}
      </Text>

      {cards.map(card => {
        const isSelected = selectedCardId === card.id;
        return (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.paymentOption,
              isSelected && styles.paymentOptionSelected,
            ]}
            onPress={() => onSelectCard(card.id)}
            activeOpacity={0.7}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.paymentLabel}>
                  {card.brand?.toUpperCase()} •••• {card.last_four}
                </Text>
                <Text style={styles.cardExpiry}>
                  {t('expires') || 'Expires'} {card.expiry_month}/{card.expiry_year}
                  {card.is_default && ` • ${t('default') || 'Default'}`}
                </Text>
              </View>
            </View>

            {onDeleteCard && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDeleteCard(card.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.red} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedCardId === null && styles.paymentOptionSelected,
        ]}
        onPress={() => onSelectCard(null)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.radioOuter}>
            {selectedCardId === null && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.paymentLabel}>
            {t('use_new_card') || 'Use a new card'}
          </Text>
        </View>
      </TouchableOpacity>

      {selectedCardId === null && !hideSaveCard && (
        <View style={styles.saveCardRow}>
          <CheckboxWithText
            isChecked={saveCard}
            onToggle={() => onSaveCardChange(!saveCard)}
          >
            <Text style={styles.saveCardLabel}>
              {t('save_card_for_future') || 'Save this card for future payments'}
            </Text>
          </CheckboxWithText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5EEFC',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  saveCardRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  saveCardLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});
