import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import { openAppSettings } from '../../utils/locationUtils';

interface LocationPermissionNoticeProps {
  /** Re-runs the permission check after the user returns from Settings. */
  onRetry?: () => void;
}

/**
 * Shown in place of a map when location permission has been refused.
 *
 * The map screens used to render a spinner in this case. Nothing was actually
 * loading - the permission was already settled - so the spinner ran until the
 * position read timed out, or forever when the platform never called back. A
 * refusal is a terminal state with exactly one fix, and that fix is in
 * Settings, so say so instead of implying the app is still working on it.
 */
export function LocationPermissionNotice({
  onRetry,
}: LocationPermissionNoticeProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="location-outline" size={36} color={colors.primary} />
      </View>

      <Text style={styles.title}>{t('location_permission_required')}</Text>
      <Text style={styles.message}>{t('location_permission_message')}</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={openAppSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>{t('open_settings')}</Text>
      </TouchableOpacity>

      {onRetry && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>{t('try_again')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.white,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationPermissionNotice;
