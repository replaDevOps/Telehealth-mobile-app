
import { ImageSourcePropType } from 'react-native';

export interface UserInfo {
  name: string;
  avatar: ImageSourcePropType;
}

export interface DoctorInfo extends UserInfo {
  id: string;
  serviceName?: string;
}

export interface ClinicInfo {
  name: string;
  location: string;
  image: ImageSourcePropType;
}

export interface ImageMessage {
  uri: string;
}

export interface Service {
  id: string;
  image: ImageSourcePropType;
  type: string;
  serviceGroup: string;
  serviceName: string;
  price: string;
  duration: string;
  description: string;
  procedure: string;
}

export interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  user?: UserInfo;
  images?: ImageMessage[];
  suggestions?: Service[];
}
