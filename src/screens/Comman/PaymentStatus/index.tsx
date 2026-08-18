import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { getPaymentStatus } from '@services/payments/hyperpayService';
import type { PaymentStatusData } from '../../../types/payment.types';
import { useCart } from '@context/CartContext';
import { useCartCountContext } from '@context/CartCountContext';
import { useProfileStore } from '@store';
import { styles } from './style';
import {
  PaymentOutcome,
  resolvePaymentOutcome,
  resolveTimeoutOutcome,
  shouldKeepPolling,
} from './resolvePaymentOutcome';
import type { PaymentStatus } from '../../../types/payment.types';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

const VIEWS: Record<
  PaymentOutcome,
  { title: string; body: string; icon: string; tint: string }
> = {
  confirming: {
    title: 'payment_confirming_title',
    body: 'payment_confirming_body',
    icon: 'time-outline',
    tint: colors.primary,
  },
  success: {
    title: 'payment_success_title',
    body: 'payment_success_body',
    icon: 'checkmark-circle',
    tint: colors.green,
  },
  processing: {
    title: 'payment_processing_title',
    body: 'payment_processing_body',
    icon: 'hourglass-outline',
    tint: colors.yellow,
  },
  failed: {
    title: 'payment_declined_title',
    body: 'payment_declined_body',
    icon: 'close-circle',
    tint: colors.red,
  },
  fulfillment_failed: {
    title: 'payment_unfulfilled_title',
    body: 'payment_unfulfilled_body',
    icon: 'alert-circle',
    tint: colors.yellow,
  },
  unconfirmed: {
    title: 'payment_unconfirmed_title',
    body: 'payment_unconfirmed_body',
    icon: 'help-circle',
    tint: colors.yellow,
  },
};

export function PaymentStatusScreen({ route, navigation }: any) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isArabic = i18n.language?.startsWith('ar');

  const paymentId = route?.params?.paymentId;
  const expectedAmount: number | undefined = route?.params?.expectedAmount;

  const { clearCart } = useCart();
  const { triggerRefresh } = useCartCountContext();
  const refreshProfile = useProfileStore(state => state.refreshProfile);

  const [outcome, setOutcome] = useState<PaymentOutcome>('confirming');
  const [payment, setPayment] = useState<PaymentStatusData | null>(null);

  const settledRef = useRef(false);
  const fulfilledOnceRef = useRef(false);
  /** Most recent status the server actually returned; null if none ever did. */
  const lastStatusRef = useRef<PaymentStatus | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef<number>(Date.now() + POLL_TIMEOUT_MS);
  const mountedRef = useRef(true);

  const formatAmount = useCallback(
    (amount: string, currency: string) =>
      isArabic ? `${amount} ر.س` : `${currency} ${amount}`,
    [isArabic],
  );

  /** Runs exactly once, the first time we see paid + fulfilled. */
  const onFulfilled = useCallback(() => {
    if (fulfilledOnceRef.current) return;
    fulfilledOnceRef.current = true;

    clearCart();
    triggerRefresh();
    refreshProfile().catch(() => {});
  }, [clearCart, triggerRefresh, refreshProfile]);

  const poll = useCallback(async () => {
    if (settledRef.current || !mountedRef.current) return;

    try {
      const data = await getPaymentStatus(paymentId);
      if (!mountedRef.current) return;

      setPayment(data);
      lastStatusRef.current = data.status;
      const next = resolvePaymentOutcome(data.status, data.fulfillment_status);
      setOutcome(next);

      // The screen only ever renders the mapped outcome, so log the fields it
      // was mapped from — a "Payment declined" view is otherwise impossible to
      // trace back to what the server actually said.
      console.log(
        `[PaymentStatus] payment ${paymentId}: status=${data.status} ` +
          `fulfillment=${data.fulfillment_status} amount=${data.amount} ` +
          `${data.currency} paid_at=${data.paid_at} -> ${next}`,
      );

      // The server owns the amount; this only surfaces a divergence between
      // its calculation and the preview Checkout showed the user.
      if (expectedAmount !== undefined && data.status === 'paid') {
        const charged = Number(data.amount);
        if (
          Number.isFinite(charged) &&
          Math.abs(charged - expectedAmount) >= 0.01
        ) {
          console.warn(
            `[PaymentStatus] amount mismatch: previewed ${expectedAmount.toFixed(
              2,
            )}, charged ${data.amount} ${data.currency}`,
          );
        }
      }

      if (next === 'success') onFulfilled();

      if (!shouldKeepPolling(next)) {
        settledRef.current = true;
        return;
      }
    } catch (error: any) {
      // apiClient's global response interceptor calls logout() on ANY 401.
      // A token expiring during a slow 3DS flow would otherwise have us
      // hammer the endpoint 15 more times while the app tears down the
      // session. Stop immediately; the payment still settles server-side
      // via the webhook and will appear in history.
      if (error?.status === 401) {
        console.warn('[PaymentStatus] poll unauthenticated', error?.message);
        settledRef.current = true;
        setOutcome(prev => (prev === 'confirming' ? 'unconfirmed' : prev));
        return;
      }

      // Any other failure is a network problem, not a failed payment.
      console.warn(
        `[PaymentStatus] poll failed (${error?.status ?? 'no status'})`,
        error?.message,
        JSON.stringify(error?.data ?? null),
      );
    }

    if (Date.now() >= deadlineRef.current) {
      settledRef.current = true;
      console.warn(
        `[PaymentStatus] payment ${paymentId}: polling timed out after ` +
          `${POLL_TIMEOUT_MS}ms, last status=${lastStatusRef.current ?? 'none'}`,
      );
      // Only override while still 'confirming' — a resolved outcome stands.
      setOutcome(prev =>
        prev === 'confirming'
          ? resolveTimeoutOutcome(lastStatusRef.current)
          : prev,
      );
      return;
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [paymentId, expectedAmount, onFulfilled]);

  useEffect(() => {
    mountedRef.current = true;
    poll();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  // Pause while backgrounded, re-poll immediately on return.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && !settledRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        poll();
      } else if (state !== 'active' && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [poll]);

  // Block hardware back while we are still confirming.
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => outcome === 'confirming',
    );
    return () => sub.remove();
  }, [outcome]);

  const goToClinic = () =>
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'EntryPoint',
          params: { screen: 'Clinic', params: { screen: 'ClinicScreen' } },
        },
      ],
    });

  const goToHistory = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'EntryPoint', params: { screen: 'History' } }],
    });

  const view = VIEWS[outcome];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {outcome === 'confirming' ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: view.tint + '1A' }]}>
            <Ionicons name={view.icon} size={44} color={view.tint} />
          </View>
        )}

        <Text style={styles.title}>{t(view.title)}</Text>
        <Text style={styles.body}>{t(view.body)}</Text>

        {/*
          Only ever show an amount for a payment the server confirmed as paid.
          Rendering `payment.amount` for a pending checkout would present the
          cart total as a charge the user never made.
        */}
        {payment?.status === 'paid' && (
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('payment_amount_charged')}
              </Text>
              <Text style={styles.detailValue}>
                {formatAmount(payment.amount, payment.currency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('payment_reference')}</Text>
              <Text style={styles.detailValue}>
                {payment.payment_reference}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: 16 + insets.bottom }]}>
        {outcome === 'success' && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToClinic}>
            <Text style={styles.primaryButtonText}>{t('done')}</Text>
          </TouchableOpacity>
        )}

        {(outcome === 'processing' ||
          outcome === 'fulfillment_failed' ||
          outcome === 'unconfirmed') && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToHistory}>
            <Text style={styles.primaryButtonText}>{t('view_history')}</Text>
          </TouchableOpacity>
        )}

        {outcome === 'failed' && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>{t('try_again')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goToClinic}
            >
              <Text style={styles.secondaryButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
