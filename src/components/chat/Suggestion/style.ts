
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  suggestionsContainer: {
    marginTop: 12,
    gap: 10,
    paddingRight: 8,
  },
  suggestionCard: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B0A8E3',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 12,
  },
  suggestionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  suggestionContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  coinIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  loyaltyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  categoryTagText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
});
