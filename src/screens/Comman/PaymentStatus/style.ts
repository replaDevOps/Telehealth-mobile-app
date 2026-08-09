import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  detailBox: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.gray,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: colors.secondaryText },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  actions: { paddingHorizontal: 24, gap: 12 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
