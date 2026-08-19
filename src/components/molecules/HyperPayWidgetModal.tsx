import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants';
import { colors } from '../../styles/colors';
import {
  classifyHyperPayUrl,
  isTerminalUrlKind,
  isPaymentAttemptNavigation,
} from '../../screens/Comman/PaymentWebView/classifyHyperPayUrl';

interface HyperPayWidgetModalProps {
  visible: boolean;
  onClose: () => void;
  widgetUrl?: string | null;
  resultUrl?: string | null;
  integrity?: string | null;
  brands?: string[];
  paymentUrl?: string | null;
  paymentId?: number | string;
  expectedAmount?: number;
  onHandOffToStatus: (paymentId: number | string, expectedAmount?: number) => void;
}

export function HyperPayWidgetModal({
  visible,
  onClose,
  widgetUrl,
  resultUrl,
  integrity,
  brands,
  paymentUrl,
  paymentId,
  expectedAmount,
  onHandOffToStatus,
}: HyperPayWidgetModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const handedOffRef = useRef(false);
  const attemptedRef = useRef(false);

  const webViewSource = useMemo(() => {
    if (widgetUrl && resultUrl) {
      const integrityAttr = integrity
        ? `integrity="${integrity}" crossorigin="anonymous"`
        : '';
      const brandList = (
        brands && brands.length ? brands : ['MADA', 'VISA', 'MASTER']
      ).join(' ');
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background-color: #ffffff;
      color: #111827;
    }
    .paymentWidgets { width: 100%; max-width: 100%; margin: 0 auto; }
    .wpwl-form { margin: 0 auto !important; max-width: 100% !important; border: none !important; box-shadow: none !important; }
    .wpwl-button-pay {
      background-color: #7625D7 !important;
      border-color: #7625D7 !important;
      font-weight: 600 !important;
      height: 48px !important;
      border-radius: 12px !important;
      font-size: 16px !important;
    }
    .wpwl-control {
      border-radius: 8px !important;
      height: 44px !important;
      border-color: #E5E7EB !important;
    }
  </style>
  <script>var wpwlOptions = { paymentTarget: "_top" };</script>
  <script src="${widgetUrl}" ${integrityAttr}></script>
</head>
<body>
  <form action="${resultUrl}" class="paymentWidgets" data-brands="${brandList}"></form>
</body>
</html>`;
      return { html: htmlContent, baseUrl: BASE_URL };
    }
    return { uri: paymentUrl || '' };
  }, [widgetUrl, resultUrl, integrity, brands, paymentUrl]);

  const handOff = useCallback(() => {
    if (handedOffRef.current || !paymentId) return;
    handedOffRef.current = true;
    onClose();
    onHandOffToStatus(paymentId, expectedAmount);
  }, [paymentId, expectedAmount, onClose, onHandOffToStatus]);

  const confirmLeave = useCallback(() => {
    if (handedOffRef.current) return;

    if (!attemptedRef.current && !widgetUrl) {
      onClose();
      return;
    }

    Alert.alert(
      t('abandon_payment_title') || 'Leave payment?',
      t('abandon_payment_confirm') ||
        "If you've already entered your card details, leaving now may still result in a charge. We'll check your payment status.",
      [
        { text: t('stay') || 'Stay', style: 'cancel' },
        {
          text: t('leave') || 'Leave',
          style: 'destructive',
          onPress: handOff,
        },
      ],
      { cancelable: true },
    );
  }, [t, handOff, onClose, widgetUrl]);

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (
        isPaymentAttemptNavigation(
          navState.url,
          paymentUrl || resultUrl || widgetUrl,
        )
      ) {
        attemptedRef.current = true;
      }

      const kind = classifyHyperPayUrl(navState.url, BASE_URL);

      if (isTerminalUrlKind(kind)) {
        handOff();
      }
    },
    [handOff, paymentUrl, resultUrl, widgetUrl],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={confirmLeave}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.sheetContainer}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={confirmLeave}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('payment_title') || 'Payment'}</Text>
              <View style={styles.closeButton} />
            </View>

            <View style={styles.body}>
              <WebView
                source={webViewSource}
                originWhitelist={['https://*']}
                javaScriptEnabled
                domStorageEnabled
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                setSupportMultipleWindows={false}
                onNavigationStateChange={onNavigationStateChange}
                onLoadEnd={() => setLoading(false)}
                onError={handOff}
                onHttpError={({ nativeEvent }) => {
                  if (paymentUrl && nativeEvent.url === paymentUrl) handOff();
                }}
                style={styles.webview}
              />

              {loading && (
                <View style={styles.loadingOverlay} pointerEvents="none">
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    marginTop: 60,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
