import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import type {
  PrepareCartPayload,
  PrepareResponseData,
  PaymentStatusData,
  SavedCard,
} from '../../types/payment.types';

export interface PaymentServiceError {
  status?: number;
  message: string;
  data?: unknown;
}

function fail(
  message: string,
  body: any,
  status?: number,
): PaymentServiceError {
  return { status, message: body?.message || message, data: body };
}

/**
 * Payment bugs are only reproducible from what the server actually returned —
 * the screens render a mapped outcome, which hides the raw body. `api-client`
 * logs requests but not responses, so log these two here.
 */
function logResponse(label: string, status: number | undefined, body: unknown) {
  let printable: string;
  try {
    printable = JSON.stringify(body);
  } catch {
    printable = String(body);
  }
  console.log(`[HyperPay] ${label} <- ${status ?? '???'}`, printable);
}

/**
 * Creates a pending payment and a HyperPay checkout for the caller's cart.
 * The amount is computed server-side from the cart; nothing here influences it.
 */
export async function prepareCartCheckout(
  payload: PrepareCartPayload,
): Promise<PrepareResponseData> {
  console.log('💳 [HyperPay] 1. Preparing Cart Checkout with payload:', JSON.stringify(payload, null, 2));
  const response = await apiClient.post(API.PAYMENTS.HYPERPAY.PREPARE, payload);
  const body = response?.data;
  console.log('💳 [HyperPay] 1. Prepare Cart Checkout Response:', JSON.stringify(body, null, 2));

  if (!body?.success || !body?.data || typeof body.data.payment_id !== 'number') {
    throw fail('Failed to create checkout', body, response?.status);
  }

  return body.data as PrepareResponseData;
}

/** Reads the verified payment + fulfilment state. Owner-token only. */
export async function getPaymentStatus(
  paymentId: number | string,
): Promise<PaymentStatusData> {
  console.log(`🔍 [HyperPay] 2. Polling Payment Status for payment_id: ${paymentId}...`);
  const response = await apiClient.get(
    `${API.PAYMENTS.HYPERPAY.STATUS}/${paymentId}`,
  );
  const body = response?.data;
  console.log(`🔍 [HyperPay] 2. Payment Status Response for ${paymentId}:`, JSON.stringify(body, null, 2));

  if (!body?.success || !body?.data) {
    throw fail('Failed to fetch payment status', body, response?.status);
  }

  return body.data as PrepareResponseData & PaymentStatusData;
}

/** Fetches list of saved cards for the authenticated user. */
export async function getSavedCards(): Promise<SavedCard[]> {
  try {
    const response = await apiClient.get(API.PAYMENTS.HYPERPAY.CARDS);
    const body = response?.data;
    logResponse('getSavedCards', response?.status, body);

    let rawCards: any[] = [];
    if (Array.isArray(body?.data?.cards)) {
      rawCards = body.data.cards;
    } else if (Array.isArray(body?.data)) {
      rawCards = body.data;
    } else if (Array.isArray(body?.cards)) {
      rawCards = body.cards;
    } else if (Array.isArray(body?.data?.data)) {
      rawCards = body.data.data;
    } else if (Array.isArray(body)) {
      rawCards = body;
    }

    return rawCards.map((c: any) => ({
      id: Number(c.id ?? c.card_id ?? c.registration_id),
      brand: String(c.brand || c.card_brand || c.payment_brand || 'VISA').toUpperCase(),
      last_four: String(c.last_four || c.last4 || c.card_number || '0000').slice(-4),
      expiry_month: String(c.expiry_month || c.month || '01').padStart(2, '0'),
      expiry_year: String(c.expiry_year || c.year || '2030'),
      is_default: Boolean(c.is_default || c.default),
      registration_id: String(c.registration_id || c.id || ''),
    }));
  } catch (error) {
    console.warn('[HyperPay] getSavedCards failed:', error);
    return [];
  }
}

/** Sets a saved card as default. */
export async function setDefaultCard(cardId: number | string): Promise<void> {
  const response = await apiClient.patch(
    `${API.PAYMENTS.HYPERPAY.CARDS}/${cardId}`,
  );
  const body = response?.data;
  logResponse(`setDefaultCard/${cardId}`, response?.status, body);

  if (!body?.success) {
    throw fail('Failed to set default card', body, response?.status);
  }
}

/** Deletes a saved card. */
export async function deleteSavedCard(cardId: number | string): Promise<void> {
  const response = await apiClient.delete(
    `${API.PAYMENTS.HYPERPAY.CARDS}/${cardId}`,
  );
  const body = response?.data;
  logResponse(`deleteSavedCard/${cardId}`, response?.status, body);

  if (!body?.success) {
    throw fail('Failed to delete saved card', body, response?.status);
  }
}
