jest.mock('@services/api/api-client', () => ({
  apiClient: { post: jest.fn(), get: jest.fn() },
}));

import { apiClient } from '@services/api/api-client';
import { prepareCartCheckout, getPaymentStatus } from '../hyperpayService';
import type { PrepareCartPayload } from '../../../types/payment.types';

const mockPost = apiClient.post as jest.Mock;
const mockGet = apiClient.get as jest.Mock;

const payload: PrepareCartPayload = {
  purpose: 'cart',
  redeem_points: 0,
  save_card: false,
  first_name: 'Ahmed',
  last_name: 'Ali',
  email: 'a@example.com',
  phone: '0500000000',
  billing_street1: 'King Fahd Rd',
  billing_city: 'Riyadh',
  billing_state: 'Riyadh',
  billing_country: 'SA',
  billing_postcode: '12211',
};

const prepareData = {
  payment_id: 11,
  payment_reference: 'PAY-1',
  checkout_id: 'chk_1',
  payment_url: 'https://backend.vena-app.com/api/payments/hyperpay/form/11',
  purpose: 'cart',
  expires_at: '2026-08-09T11:09:43+00:00',
};

beforeEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
});

describe('prepareCartCheckout', () => {
  it('posts the payload to the prepare endpoint', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: prepareData } });

    await prepareCartCheckout(payload);

    expect(mockPost).toHaveBeenCalledWith(
      '/payments/hyperpay/prepare',
      payload,
    );
  });

  it('returns the data block on success', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: prepareData } });

    await expect(prepareCartCheckout(payload)).resolves.toEqual(prepareData);
  });

  it('rejects with the server message when success is false', async () => {
    mockPost.mockResolvedValue({
      data: { success: false, message: 'Your cart is empty.' },
    });

    await expect(prepareCartCheckout(payload)).rejects.toMatchObject({
      message: 'Your cart is empty.',
    });
  });

  it('rejects when payment_id is missing even if success is true', async () => {
    mockPost.mockResolvedValue({
      data: { success: true, data: { checkout_id: 'chk_1' } },
    });

    await expect(prepareCartCheckout(payload)).rejects.toMatchObject({
      message: expect.any(String),
    });
  });
});

describe('getPaymentStatus', () => {
  const statusData = {
    payment_id: 11,
    payment_reference: 'PAY-1',
    purpose: 'cart',
    provider: 'hyperpay',
    amount: '57.50',
    currency: 'SAR',
    status: 'paid',
    fulfillment_status: 'fulfilled',
    expires_at: null,
    paid_at: '2026-08-09T11:00:00+00:00',
    fulfilled_at: '2026-08-09T11:00:02+00:00',
  };

  it('appends the payment id to the status path', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: statusData } });

    await getPaymentStatus(11);

    expect(mockGet).toHaveBeenCalledWith('/payments/hyperpay/status/11');
  });

  it('returns the data block on success', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: statusData } });

    await expect(getPaymentStatus(11)).resolves.toEqual(statusData);
  });

  it('rejects when the body has no data block', async () => {
    mockGet.mockResolvedValue({ data: { success: true } });

    await expect(getPaymentStatus(11)).rejects.toMatchObject({
      message: expect.any(String),
    });
  });
});
