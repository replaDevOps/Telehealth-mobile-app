export type Clinic = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  location: string;
  image: any;
  isFeatured?: boolean;
};

export type ClinicDetails = {
  id: number;
  clinicID: number;
  logo: string | null;
  coverImage: string | null;
  businessName: string;
  businessEmail: string;
  businessNumber: string;
  city: string | null;
  district: string | null;
  website: string | null;
  address: string | null;
  lat: number | null;
  long: number | null;
  about: string | null;
  chatConsultation: boolean | null;
  chatConsultationPrice: number | null;
  voiceConsultation: boolean | null;
  voiceConsultationPrice: number | null;
  videoConsultation: boolean | null;
  videoConsultationPrice: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClinicApiResponse = {
  clinicID: number;
  name: string;
  clinicName: string | null;
  is_featured: boolean | null;
  businessType: string | null;
  avgRating: string;
  details: ClinicDetails | null;
};

export type ClinicDetailResponse = {
  clinicID: number;
  name: string;
  clinicName: string | null;
  is_featured: boolean | null;
  businessType: string | null;
  loyaltyPoints: number | null;
  avgRating: string;
  distance: number | null;
  details: ClinicDetails | null;
};

export type Device = {
  id: number;
  name: string;
};

export type ServiceGroup = {
  id: number;
  clinicID: number;
  addedBy: number;
  serviceType: string;
  name: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClinicService = {
  id: number;
  clinicID: number;
  addedBy: number;
  groupID: number;
  image: string;
  serviceType: string;
  tags: string;
  name: string;
  description: string;
  procedure: string;
  loyality: boolean;
  bonusLoyalityPoints: string | null;
  price: string;
  duration: number;
  status: string;
  created_at: string;
  updated_at: string;
  devices: Device[];
  group: ServiceGroup;
};

export type ReviewUser = {
  id: number;
  name: string;
  image: string | null;
};

export type ClinicReview = {
  id: number;
  clinicID: number;
  userID: number;
  rating: string;
  review: string;
  date: string;
  created_at: string;
  updated_at: string;
  user: ReviewUser;
};

export type ClinicDevice = {
  id: number | string;
  clinicID?: number;
  addedBy?: number;
  groupID?: number;
  serviceIDs?: string[];
  image: string | { uri: string };
  serviceType?: string;
  name?: string;
  title?: string;
  purpose?: string;
  notes?: string | null;
  note?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  service_details?: Array<{
    id: number;
    name: string;
  }>;
  group?: ServiceGroup;
  badge?: { [key: string]: string };
};

export type ClinicDescriptionResponse = {
  data: ClinicDetails;
  devices: ClinicDevice[];
};

export type DeviceDetailResponse = ClinicDevice;

export type ServiceFilterOption = {
  id: number;
  name: string;
};
