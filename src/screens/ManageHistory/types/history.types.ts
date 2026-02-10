/* types/history.types.ts */

export type Tab = 'consultation' | 'payment';
export type PaymentKind = 'consultation' | 'appointment';
export type ConsultationType = 'Chat' | 'Video' | 'Audio';

export interface ConsultationItem {
  id: string;
  date: string;
  serviceName: string;
  duration: string;
  type: ConsultationType;
  icon: string;
  doctorName: string;
  doctorAvatar: string;
  clinicName: string;
  price: string;
}

export interface PaymentConsultationItem {
  id: string;
  kind: 'consultation';
  date: string;
  paymentId: string;
  type?: ConsultationType;
  duration?: string;
  serviceName: string;
  doctorStatus?: string;
  doctorName?: string;
  doctorAvatar?: string;
  clinicName: string;
  clinicLocation?: string;
  price: string;
  status: string;
  statusColor: string;
}

export interface PaymentAppointmentItem {
  id: string;
  kind: 'appointment';
  date: string;
  paymentId: string;
  clinicImg?: boolean;
  clinicImage?: string;
  clinicName: string;
  clinicLocation: string;
  numberOfService: string;
  price: string;
  status: string;
  statusColor: string;
  services: ServiceDetail[];
}

export interface ServiceDetail {
  id: number;
  name: string;
  duration: string;
  price: string;
  category: string;
  categoryBadge: string;
  image: any;
}

export type PaymentItem = PaymentConsultationItem | PaymentAppointmentItem;

export interface DropdownOption {
  label: string;
  value: PaymentKind;
}