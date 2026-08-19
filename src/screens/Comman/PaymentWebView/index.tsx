import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  classifyHyperPayUrl,
  isTerminalUrlKind,
  isPaymentAttemptNavigation,
} from './classifyHyperPayUrl';

export function PaymentWebViewScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const {
    widgetUrl,
    resultUrl,
    integrity,
    brands,
    paymentUrl,
    paymentId,
    expectedAmount,
  } = route?.params ?? {};

  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const handedOffRef = useRef(false);
  /** Set once the WebView leaves the page the widget opened on. */
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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 16px; background-color: #ffffff; color: #111827; }
    .paymentWidgets { width: 100%; max-width: 100%; margin: 0 auto; }
    .wpwl-form { margin: 0 auto !important; max-width: 100% !important; }
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

    // If nothing was submitted or using inline widget, confirm if user leaves
    if (!attemptedRef.current && !widgetUrl) {
      navigation.goBack();
      return;
    }

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
  }, [t, handOffToStatus, navigation, widgetUrl]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave();
      return true;
    });
    return () => sub.remove();
  }, [confirmLeave]);

  const checkAndInterceptUrl = useCallback(
    (url: string) => {
      if (!url) return false;
      const lowerUrl = url.toLowerCase();
      const kind = classifyHyperPayUrl(url, BASE_URL);

      if (
        isTerminalUrlKind(kind) ||
        lowerUrl.includes('/payments/hyperpay/success') ||
        lowerUrl.includes('/payments/hyperpay/pending') ||
        lowerUrl.includes('/payments/hyperpay/failed') ||
        lowerUrl.includes('/hyperpay/success') ||
        lowerUrl.includes('/hyperpay/pending') ||
        lowerUrl.includes('/hyperpay/failed')
      ) {
        handOffToStatus();
        return true;
      }
      return false;
    },
    [handOffToStatus],
  );

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

      if (checkAndInterceptUrl(navState.url)) {
        webViewRef.current?.stopLoading();
      }
    },
    [checkAndInterceptUrl, paymentUrl, resultUrl, widgetUrl],
  );

  const autoSubmitScript = `
    (function() {
      try {
        var text = (document.body && document.body.innerText) || '';
        if (text.indexOf('Problems in Asynchronous Payment Processing') !== -1 || text.indexOf('session timeout') !== -1) {
          window.location.href = '${BASE_URL}/api/payments/hyperpay/failed';
          return;
        }
        if (text.indexOf('transaction state') !== -1 || text.indexOf('Select authentication outcome') !== -1) {
          var select = document.querySelector('select');
          if (select) {
            for (var i = 0; i < select.options.length; i++) {
              var optText = select.options[i].text.toLowerCase();
              if (optText.indexOf('success') !== -1 || optText.indexOf('approve') !== -1) {
                select.selectedIndex = i;
                break;
              }
            }
          }
          var btn = document.querySelector('input[type="submit"], button[type="submit"], input[value="Pay"], input[value="Submit"]');
          if (btn) {
            btn.click();
          } else {
            var form = document.querySelector('form');
            if (form) form.submit();
          }
        }
      } catch(e) {}
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={confirmLeave}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment_title')}</Text>
        <View style={styles.headerButton} />
      </View>

      <WebView
        ref={webViewRef}
        source={webViewSource}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        injectedJavaScript={autoSubmitScript}
        onShouldStartLoadWithRequest={(request) => {
          if (checkAndInterceptUrl(request.url)) {
            return false;
          }
          return true;
        }}
        onNavigationStateChange={onNavigationStateChange}
        onLoadEnd={() => {
          setLoading(false);
          webViewRef.current?.injectJavaScript(autoSubmitScript);
        }}
        onError={handOffToStatus}
        onHttpError={({ nativeEvent }) => {
          if (paymentUrl && nativeEvent.url === paymentUrl) handOffToStatus();
        }}
        style={styles.webview}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
