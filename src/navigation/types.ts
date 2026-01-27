import type { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList } from './AuthNavigator';
import { MainStackParamList } from './MainNavigator';

// Root Stack
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
} & MainStackParamList;

// Navigation Props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}