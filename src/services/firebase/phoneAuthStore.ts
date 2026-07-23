import type { PhoneConfirmation } from './phoneAuth';

let currentConfirmation: PhoneConfirmation | null = null;

export const setPhoneConfirmation = (c: PhoneConfirmation | null) => {
  currentConfirmation = c;
};

export const getPhoneConfirmation = (): PhoneConfirmation | null =>
  currentConfirmation;

export const clearPhoneConfirmation = () => {
  currentConfirmation = null;
};
