import { useCartStore } from '../useCartStore';

const item = (id: string | number) =>
  ({
    service: {
      id: String(id),
      image: null,
      type: 't',
      serviceGroup: 'g',
      serviceName: 'n',
      price: 'SAR 100.00',
      duration: '30',
    },
    clinic: {
      id: 'c1',
      name: 'Clinic',
      location: 'here',
      image: null,
      specialty: 's',
      rating: 5,
    },
  }) as any;

beforeEach(() => {
  useCartStore.setState({ cartItems: [], cartServiceIds: [] });
});

describe('useCartStore', () => {
  it('tracks membership by id', () => {
    const { addToCart } = useCartStore.getState();
    addToCart(item(61));

    expect(useCartStore.getState().isInCart(61)).toBe(true);
    // The API returns numbers and screen params carry strings; both must hit.
    expect(useCartStore.getState().isInCart('61')).toBe(true);
    expect(useCartStore.getState().isInCart(62)).toBe(false);
  });

  it('does not double-add the same service', () => {
    const { addToCart } = useCartStore.getState();
    addToCart(item(61));
    addToCart(item(61));

    expect(useCartStore.getState().cartServiceIds).toEqual(['61']);
    expect(useCartStore.getState().cartItems).toHaveLength(1);
  });

  it('drops both the item and the id on remove', () => {
    const { addToCart } = useCartStore.getState();
    addToCart(item(61));
    useCartStore.getState().removeFromCart('61');

    expect(useCartStore.getState().isInCart(61)).toBe(false);
    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  it('lets the server replace the id set wholesale', () => {
    // The restart case: IDs come back from storage with no items behind them,
    // and the first server response is the authority on what is really there.
    useCartStore.setState({ cartItems: [], cartServiceIds: ['61', '74'] });
    expect(useCartStore.getState().isInCart(61)).toBe(true);

    useCartStore.getState().syncFromServer([74]);

    expect(useCartStore.getState().isInCart(61)).toBe(false);
    expect(useCartStore.getState().isInCart(74)).toBe(true);
  });

  it('treats an empty server response as an empty cart', () => {
    useCartStore.setState({ cartItems: [], cartServiceIds: ['61'] });
    useCartStore.getState().syncFromServer([]);

    expect(useCartStore.getState().cartServiceIds).toEqual([]);
  });

  it('drops items the server no longer reports', () => {
    const { addToCart } = useCartStore.getState();
    addToCart(item(61));
    addToCart(item(74));

    useCartStore.getState().syncFromServer([74]);

    expect(useCartStore.getState().cartItems).toHaveLength(1);
    expect(useCartStore.getState().cartItems[0].service.id).toBe('74');
  });

  it('sums prices, ignoring unparseable ones', () => {
    const { addToCart } = useCartStore.getState();
    addToCart(item(61));
    const weird = item(62);
    weird.service.price = 'N/A';
    addToCart(weird);

    expect(useCartStore.getState().getCartTotal()).toBe(100);
  });

  it('clears everything', () => {
    useCartStore.getState().addToCart(item(61));
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().cartServiceIds).toEqual([]);
    expect(useCartStore.getState().cartItems).toEqual([]);
  });
});
