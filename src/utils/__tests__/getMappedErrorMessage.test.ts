import i18n from '../../services/i18n';
import { getMappedErrorMessage } from '../getMappedErrorMessage';

const AUTH_COLLISION = 'Email or Phone number is already registered';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('getMappedErrorMessage — cart vs auth collisions', () => {
  // The regression: /cart/add answers a duplicate with a message containing
  // "already exist", which the auth rule claimed, so adding a service twice
  // reported an account-registration error the API never sent.
  it.each([
    'Service already exists in the cart',
    'This service already exists in your cart.',
    'Service already exist in cart',
  ])('does not report an auth collision for %p', msg => {
    expect(getMappedErrorMessage(msg)).not.toBe(AUTH_COLLISION);
  });

  it('reports a duplicate cart add as a cart problem', () => {
    expect(getMappedErrorMessage('Service already exists in the cart')).toBe(
      'This service is already in your cart',
    );
  });

  it('still reports genuine account collisions', () => {
    expect(getMappedErrorMessage('This email is already registered')).toBe(
      AUTH_COLLISION,
    );
    expect(getMappedErrorMessage('An account already exists for this phone')).toBe(
      AUTH_COLLISION,
    );
  });

  it('leaves an unqualified "already exists" alone rather than guessing', () => {
    // No cart, no user identifier: claiming either meaning would be inventing
    // information, so the backend's own wording survives.
    expect(getMappedErrorMessage('Record already exists')).toBe(
      'Record already exists',
    );
  });

  it('does not hijack the cart success messages', () => {
    expect(getMappedErrorMessage('Service added to cart successfully')).toBe(
      'Service added to cart successfully',
    );
    expect(getMappedErrorMessage('Service removed from cart successfully')).toBe(
      'Service removed from cart successfully',
    );
  });

  it('translates the duplicate-cart message in Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(getMappedErrorMessage('Service already exists in the cart')).toBe(
      'هذه الخدمة موجودة بالفعل في السلة',
    );
  });
});
