import { StackActions } from '@react-navigation/native';
import { navigationRef, returnFromAuth } from '../navigation-service';

// Stand in for the real container: these helpers are pure decisions over the
// root navigation state, so the state is all the test needs to supply.
const mockRef = navigationRef as unknown as {
  isReady: jest.Mock;
  getRootState: jest.Mock;
  dispatch: jest.Mock;
  reset: jest.Mock;
};

const rootState = (names: string[]) => ({
  key: 'root-key',
  index: names.length - 1,
  routes: names.map(name => ({ key: `${name}-key`, name })),
});

beforeEach(() => {
  mockRef.isReady = jest.fn(() => true);
  mockRef.getRootState = jest.fn();
  mockRef.dispatch = jest.fn();
  mockRef.reset = jest.fn();
});

describe('returnFromAuth', () => {
  it('pops the Auth route when a live Main sits beneath it', () => {
    mockRef.getRootState.mockReturnValue(rootState(['Main', 'Auth']));

    returnFromAuth();

    expect(mockRef.reset).not.toHaveBeenCalled();
    expect(mockRef.dispatch).toHaveBeenCalledWith({
      ...StackActions.pop(1),
      // Targeting the root is the whole point: untargeted, the focused Auth
      // stack would swallow the pop and step back inside itself.
      target: 'root-key',
    });
  });

  it('builds the marketplace when Auth is the only root route', () => {
    // The cold start path: Splash replaced itself with Auth, so there is no
    // screen to return to.
    mockRef.getRootState.mockReturnValue(rootState(['Auth']));

    returnFromAuth();

    expect(mockRef.dispatch).not.toHaveBeenCalled();
    expect(mockRef.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'EntryPoint' } }],
    });
  });

  it('does not return to a route that is not Main', () => {
    mockRef.getRootState.mockReturnValue(rootState(['Splash', 'Auth']));

    returnFromAuth();

    expect(mockRef.dispatch).not.toHaveBeenCalled();
    expect(mockRef.reset).toHaveBeenCalled();
  });

  it('is inert before the container mounts', () => {
    mockRef.isReady = jest.fn(() => false);

    returnFromAuth();

    expect(mockRef.dispatch).not.toHaveBeenCalled();
    expect(mockRef.reset).not.toHaveBeenCalled();
  });
});
