import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { classifyHyperPayUrl, isTerminalUrlKind } from './classifyHyperPayUrl';

export function PaymentWebViewScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { paymentUrl, paymentId, expectedAmount } = route?.params ?? {};

  const [loading, setLoading] = useState(true);
  const handedOffRef = useRef(false);

  /**
   * Replaces this screen with the status screen. Guarded because the WebView
   * can report the same navigation more than once.
   */
  const handOffToStatus = useCallback(() => {
    if (handedOffRef.current) return;
    handedOffRef.current = true;
    navigation.replace('PaymentStatus', { paymentId, expectedAmount });
  }, [navigation, paymentId, expectedAmount]);

  const confirmLeave = useCallback(() => {
    if (handedOffRef.current) return;

    Alert.alert(
      t('abandon_payment_title'),
      t('abandon_payment_confirm'),
      [
        { text: t('stay'), style: 'cancel' },
        {
          text: t('leave'),
          style: 'destructive',
          // Never drop the user back on Checkout — they may have been
          // charged, and only the status poll can tell us.
          onPress: handOffToStatus,
        },
      ],
      { cancelable: true },
    );
  }, [t, handOffToStatus]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave();
      return true;
    });
    return () => sub.remove();
  }, [confirmLeave]);

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const kind = classifyHyperPayUrl(navState.url, BASE_URL);

      // 'result' is intentionally left alone: loading it is what triggers
      // backend verification and fulfilment.
      if (isTerminalUrlKind(kind)) handOffToStatus();
    },
    [handOffToStatus],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={confirmLeave}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment_title')}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.webview}>
        <WebView
          source={{ uri: paymentUrl }}
          // 3DS hands off to arbitrary issuing-bank domains, so navigation
          // cannot be restricted to known hosts. The origin check inside
          // classifyHyperPayUrl is what keeps a foreign page from driving
          // the app into a success state.
          originWhitelist={['https://*']}
          javaScriptEnabled
          domStorageEnabled
          // Both are required for 3DS to complete.
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          setSupportMultipleWindows={false}
          onNavigationStateChange={onNavigationStateChange}
          onLoadEnd={() => setLoading(false)}
          onError={handOffToStatus}
          onHttpError={({ nativeEvent }) => {
            // Only bail on the initial document failing, not on a sub-resource.
            if (nativeEvent.url === paymentUrl) handOffToStatus();
          }}
          style={styles.webview}
        />

        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
