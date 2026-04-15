
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
  isUploading?: boolean;
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
  clinicName?: string;
  loyality?: boolean;
  bonusLoyalityPoints?: string;
  totalLoyalityPoints?: string | number;
  category?: 'service' | 'device';
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
