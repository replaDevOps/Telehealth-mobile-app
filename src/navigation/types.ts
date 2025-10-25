import type { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList } from './AuthNavigator';
import { TabParamList } from './bottomTab';

// Root Stack
export type RootStackParamList = {
  Splash: undefined; // 👈 Add this line
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<TabParamList>;
};

// Navigation Props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}