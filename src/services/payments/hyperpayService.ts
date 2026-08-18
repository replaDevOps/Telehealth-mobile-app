import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import type {
  PrepareCartPayload,
  PrepareResponseData,
  PaymentStatusData,
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
  const response = await apiClient.post(API.PAYMENTS.HYPERPAY.PREPARE, payload);
  const body = response?.data;
  logResponse('prepare', response?.status, body);

  if (!body?.success || !body?.data?.payment_url) {
    throw fail('Failed to create checkout', body, response?.status);
  }

  return body.data as PrepareResponseData;
}

/** Reads the verified payment + fulfilment state. Owner-token only. */
export async function getPaymentStatus(
  paymentId: number | string,
): Promise<PaymentStatusData> {
  const response = await apiClient.get(
    `${API.PAYMENTS.HYPERPAY.STATUS}/${paymentId}`,
  );
  const body = response?.data;
  logResponse(`status/${paymentId}`, response?.status, body);

  if (!body?.success || !body?.data) {
    throw fail('Failed to fetch payment status', body, response?.status);
  }

  return body.data as PaymentStatusData;
}
