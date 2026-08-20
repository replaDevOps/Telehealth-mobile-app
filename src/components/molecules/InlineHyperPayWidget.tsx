import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants';
import { colors } from '../../styles/colors';
import {
  classifyHyperPayUrl,
  isTerminalUrlKind,
  isPaymentAttemptNavigation,
} from '../../screens/Comman/PaymentWebView/classifyHyperPayUrl';

export interface InlineHyperPayWidgetRef {
  submitForm: () => void;
}

interface InlineHyperPayWidgetProps {
  widgetUrl: string;
  resultUrl: string;
  integrity?: string | null;
  brands?: string[];
  paymentId: number | string;
  expectedAmount?: number;
  onHandOffToStatus: (paymentId: number | string, expectedAmount?: number) => void;
  onCardFormFilled?: (isFilled: boolean) => void;
}

export const InlineHyperPayWidget = forwardRef<
  InlineHyperPayWidgetRef,
  InlineHyperPayWidgetProps
>(
  (
    {
      widgetUrl,
      resultUrl,
      integrity,
      brands,
      paymentId,
      expectedAmount,
      onHandOffToStatus,
      onCardFormFilled,
    },
    ref,
  ) => {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const handedOffRef = useRef(false);

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            var btn = document.querySelector('.wpwl-button-pay') || document.querySelector('button[type="submit"]');
            if (btn) {
              btn.click();
            } else {
              var form = document.querySelector('.wpwl-form') || document.querySelector('form.paymentWidgets');
              if (form) form.submit();
            }
          })();
          true;
        `);
      },
    }));

    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const webViewSource = useMemo(() => {
      const integrityAttr = integrity
        ? `integrity="${integrity}" crossorigin="anonymous"`
        : '';
      const brandList = (
        brands && brands.length ? brands : ['MADA', 'VISA', 'MASTER']
      ).join(' ');

      const htmlContent = `<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body, html {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #111827;
      overflow: hidden;
      direction: ${isArabic ? 'rtl' : 'ltr'};
      text-align: ${isArabic ? 'right' : 'left'};
    }
    .paymentWidgets { width: 100%; max-width: 100%; margin: 0 auto; padding: 10px 14px; background: #ffffff !important; }
    .wpwl-form, .wpwl-container, div.wpwl-wrapper, form.wpwl-form-card {
      margin: 0 auto !important;
      max-width: 100% !important;
      border: none !important;
      box-shadow: none !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
      background-image: none !important;
    }
    .wpwl-button-pay {
      display: none !important;
    }
    .wpwl-control {
      border-radius: 10px !important;
      height: 42px !important;
      border-color: #E5E7EB !important;
      background-color: #ffffff !important;
      font-size: 14px !important;
      text-align: ${isArabic ? 'right' : 'left'} !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    .wpwl-control-cardHolder {
      direction: ${isArabic ? 'rtl' : 'ltr'} !important;
    }
    .wpwl-label {
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #374151 !important;
      margin-bottom: 3px !important;
      text-align: ${isArabic ? 'right' : 'left'} !important;
    }
    .wpwl-group {
      margin-bottom: 8px !important;
    }
  </style>
  <script>
    var wpwlOptions = {
      locale: "${isArabic ? 'ar' : 'en'}",
      paymentTarget: "_top",
      labels: {
        cardHolder: "${isArabic ? 'اسم حامل البطاقة' : 'Card holder'}",
        cardNumber: "${isArabic ? 'رقم البطاقة' : 'Card Number'}",
        expiryDate: "${isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}",
        cvv: "${isArabic ? 'رمز الأمان' : 'CVV'}",
        brand: "${isArabic ? 'نوع البطاقة' : 'Brand'}"
      }
    };
  </script>
  <script src="${widgetUrl}" ${integrityAttr}></script>
  <script>
    (function() {
      function checkFormState() {
        try {
          var num = document.querySelector('.wpwl-control-cardNumber');
          var exp = document.querySelector('.wpwl-control-expiry');
          var cvv = document.querySelector('.wpwl-control-cvv');
          var name = document.querySelector('.wpwl-control-cardHolder');
          
          var numVal = num ? num.value.replace(/\\s/g, '') : '';
          var expVal = exp ? exp.value.replace(/\\s/g, '') : '';
          var cvvVal = cvv ? cvv.value.replace(/\\s/g, '') : '';
          var nameVal = name ? name.value.trim() : '';

          var numFilled = numVal.length >= 12;
          var expFilled = expVal.length >= 4;
          var cvvFilled = cvvVal.length >= 3;
          var nameFilled = !name || nameVal.length >= 2;

          var isFilled = numFilled && expFilled && cvvFilled && nameFilled;
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CARD_FORM_FILLED', isFilled: isFilled }));
          }
        } catch(e) {}
      }

      document.addEventListener('input', checkFormState, true);
      document.addEventListener('keyup', checkFormState, true);
      document.addEventListener('change', checkFormState, true);
      setInterval(checkFormState, 600);
    })();
  </script>
</head>
<body>
  <form action="${resultUrl}" class="paymentWidgets" data-brands="${brandList}"></form>
</body>
</html>`;

      return { html: htmlContent, baseUrl: BASE_URL };
    }, [widgetUrl, resultUrl, integrity, brands, isArabic]);

    const autoSubmitScript = `
      (function() {
        try {
          if (document.body && document.body.innerText && (document.body.innerText.indexOf('transaction state') !== -1 || document.body.innerText.indexOf('Select authentication outcome') !== -1)) {
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

    const handOff = useCallback(() => {
      if (handedOffRef.current || !paymentId) return;
      handedOffRef.current = true;
      onHandOffToStatus(paymentId, expectedAmount);
    }, [paymentId, expectedAmount, onHandOffToStatus]);

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
          handOff();
          return true;
        }
        return false;
      },
      [handOff],
    );

    const onNavigationStateChange = useCallback(
      (navState: WebViewNavigation) => {
        if (checkAndInterceptUrl(navState.url)) {
          webViewRef.current?.stopLoading();
        }
      },
      [checkAndInterceptUrl],
    );

    return (
      <View style={styles.container}>
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
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data?.type === 'CARD_FORM_FILLED') {
                onCardFormFilled?.(Boolean(data.isFilled));
              }
            } catch (e) {}
          }}
          onNavigationStateChange={onNavigationStateChange}
          onLoadEnd={() => {
            setLoading(false);
            webViewRef.current?.injectJavaScript(autoSubmitScript);
          }}
          onError={handOff}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.url.includes('/payments/hyperpay/')) handOff();
          }}
          style={styles.webview}
          scrollEnabled={false}
        />

        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: 370,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
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
