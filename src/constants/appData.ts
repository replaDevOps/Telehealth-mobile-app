import { PipsImage, RecommandImage, doctor, onboarding1, onboarding2, onboarding3, patient, pimples } from "@assets/images";
import { DoctorInfo, ClinicInfo, Message } from '../types/chat.types';

export const ONBOARDING_STEPS = [
    {
      title: 'Connect to Care, Anytime.',
      imgSrc: onboarding1,
      content:
        'Book appointments, consultations, and treatments from trusted clinics',
    },
    {
      title: 'Consultation with Vena AI',
      imgSrc: onboarding2,
      content:
        'Get AI-powered guidance and insights whenever you need.',
    },
    {
      title: 'Connect Via Various Ways',
      imgSrc: onboarding3,
      content: 'Connect with your doctor through chat, audio, or video.',
    },
  ];



  export const SAMPLECLINICS = [
    {
      id: '1',
      name: 'Al Noor Health Center',
      specialty: 'Cardiology',
      rating: 4.8,
      location: 'Jeddah, Saudi Arabia',
      image: RecommandImage,
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Medina Family Clinic',
      specialty: 'Pediatrics',
      rating: 4.6,
      location: 'Medina, Saudi Arabia',
      image: RecommandImage,
      isFeatured: true,
    },
    {
      id: '3',
      name: 'CureWell Medical Complex',
      specialty: 'Neurology',
      rating: 4.7,
      location: 'Riyadh, Saudi Arabia',
      image: RecommandImage,
      isFeatured: false,
    },
  ];
  
  export const NEARBYCLINICS = [
    {
      id: '1',
      name: 'HealthPlus Center',
      specialty: 'Radiology',
      rating: 4.4,
      location: 'Makkah, Saudi Arabia',
      image: RecommandImage,
    },
    {
      id: '2',
      name: 'Al Shifa Clinic',
      specialty: 'General Medicine',
      rating: 4.9,
      location: 'Makkah, Saudi Arabia',
      image: RecommandImage,
    },
    {
      id: '3',
      name: 'Vision Eye Care',
      specialty: 'Ophthalmology',
      rating: 4.6,
      location: 'Makkah, Saudi Arabia',
      image: RecommandImage,
    },
    {
      id: '4',
      name: 'Smile Dental Studio',
      specialty: 'Dentistry',
      rating: 4.7,
      location: 'Makkah, Saudi Arabia',
      image: RecommandImage,
    },
  ];
  

export const SERVICES = [

  {

    id: '1',

    image: PipsImage,

    type: 'Dermatology',

    serviceGroup: 'Skin',

    serviceName: 'HydraFacial Glow',

    price: '350 SAR',

    duration: '45 min',

    description:

      'A multi-step facial treatment that deeply cleanses, exfoliates, and hydrates the skin, leaving it refreshed and glowing.',

    procedure:

      'The procedure uses a patented device to cleanse and infuse serums into the skin for maximum hydration and brightness.',

  },

  {

    id: '2',

    image: PipsImage,

    type: 'Dentistry',

    serviceGroup: 'Teeth Whitening',

    serviceName: 'Laser Smile Brightening',

    price: '600 SAR',

    duration: '1 hr',

    description:

      'Advanced laser teeth whitening procedure designed to safely and effectively brighten your smile up to 8 shades.',

    procedure:

      'A hydrogen peroxide gel is applied and activated with laser light to remove deep-set stains.',

  },

  {

    id: '3',

    image: PipsImage,

    type: 'Aesthetic',

    serviceGroup: 'Injectables',

    serviceName: 'Botox for Forehead Lines',

    price: '450 SAR',

    duration: '30 min',

    description:

      'A non-surgical cosmetic treatment that relaxes facial muscles to reduce the appearance of fine lines and wrinkles.',

    procedure:

      'Small doses of botulinum toxin are injected into targeted muscles to temporarily relax them.',

  },


];
  export const CLINIC_REVIEWS = [
    {
      id: '1',
      author: 'Sultana Khan',
      date: 'Oct 20, 2025',
      rating: 5,
      text: 'Amazing experience! The doctors were very professional and explained everything clearly. My skin feels much better after just one session!',
    },
    {
      id: '2',
      author: 'Ahmed Ali',
      date: 'Oct 18, 2025',
      rating: 4,
      text: 'Good service, but the waiting time was a bit long. Staff was friendly though.',
    },
    {
      id: '3',
      author: 'Fatima Noor',
      date: 'Oct 15, 2025',
      rating: 5,
      text: 'The HydraFacial was incredible! My face has never felt this fresh before. Highly recommended.',
    },
    {
      id: '4',
      author: 'Omar Saeed',
      date: 'Oct 12, 2025',
      rating: 3,
      text: 'The treatment worked, but I wish the clinic had better parking options.',
    },
    {
      id: '5',
      author: 'Hania Rizvi',
      date: 'Oct 8, 2025',
      rating: 5,
      text: 'Professional staff and top-quality equipment. The Botox procedure was quick and painless!',
    },
  ];

  export const CLINIC_ABOUT_DATA = {
    description:
      'At GlowCare Clinic, we believe that confidence begins with healthy skin and a beautiful smile. Our clinic specializes in dermatology, dentistry, and aesthetic care — combining advanced technology with expert medical guidance.\n' +
      'Our team of experienced doctors and skincare professionals focuses on providing personalized treatments tailored to each patient’s needs. Whether you’re looking for acne treatment, skin rejuvenation, or a brighter smile, we’re here to help you glow with confidence.',
    devices: [
      {
        id: '1',
        image: RecommandImage,
        title: 'Fractional CO₂ Laser',
        note: 'Used for skin resurfacing and scar reduction with minimal downtime.',
        badge: {
          1: 'Acne Scar Treatment',
          2: 'Wrinkle Reduction',
          3: 'Skin Tightening',
          4: 'Pigmentation Removal',
          5: 'Stretch Mark Fading',
        },
      },
      {
        id: '2',
        image: RecommandImage,
        title: 'Ultherapy Device',
        note: 'Non-invasive ultrasound lifting treatment for face and neck tightening.',
        badge: {
          1: 'Face Lifting',
          2: 'Jawline Definition',
          3: 'Skin Firming',
          4: 'Neck Contour Enhancement',
          5: 'Collagen Boost',
        },
      },
      {
        id: '3',
        image: RecommandImage,
        title: 'CoolSculpting Machine',
        note: 'Targets stubborn fat cells through controlled cooling without surgery.',
        badge: {
          1: 'Body Contouring',
          2: 'Fat Reduction',
          3: 'Tummy Sculpt',
          4: 'Thigh Slimming',
          5: 'Double Chin Removal',
        },
        },
      {
        id: '4',
        image: RecommandImage,
        title: 'PicoSure Laser',
        note: 'Advanced laser for pigmentation, tattoos, and skin texture improvement.',
        badge: {
          1: 'Tattoo Removal',
          2: 'Pigment Correction',
          3: 'Skin Brightening',
          4: 'Acne Mark Fading',
          5: 'Freckle Reduction',
        },
      },
      {
        id: '5',
        image: RecommandImage,
        title: 'Invisalign Scanner',
        note: 'Digital 3D scan for custom-made invisible dental aligners.',
        badge: {
          1: 'Teeth Alignment',
          2: 'Smile Correction',
          3: 'Jaw Adjustment',
          4: 'Gum Health Assessment',
          5: 'Digital Smile Preview',
        },
      },
    ],
  };


  export const CONSULTATION_HISTORY= [
      {
        id: '1',
        date: '10/02/2025 11:05 am',
        serviceName: 'Service Name',
        duration: '19 min',
        type: 'Chat',
        icon: 'chatbubble',
        doctorName: 'Doctor Name',
        doctorAvatar: 'https://i.pravatar.cc/100?img=1',
        clinicName: 'Clinic Name',
        price: 'SAR 20',
      },
      {
        id: '2',
        date: '10/02/2025 11:05 am',
        serviceName: 'Service Name',
        duration: '19 min',
        type: 'Audio',
        icon: 'mic',
        doctorName: 'Doctor Name',
        doctorAvatar: 'https://i.pravatar.cc/100?img=2',
        clinicName: 'Clinic Name',
        price: 'SAR 20',
      },
      // add more …
    ];
  
   export const PAYMENT_HISTORY = [
      // ---- Consultation ----
      {
        id: 'c1',
        kind: 'consultation',
        date: '10/02/2025',
        paymentId: '#12453',
        type: 'Chat',
        serviceName: 'Acne Itching Treatm...',
        doctorStatus: 'No doctor accepted!',
        clinicName: 'Eden Medical Center',
        clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
        price: 'SAR 20',
        status: 'Refund',
        statusColor: '#ef4444',
      },
      {
        id: 'c2',
        kind: 'consultation',
        date: '10/02/2025',
        paymentId: '#21234',
        type: 'Video',
        duration: '19 min',
        serviceName: 'Acne Itching Treatm...',
        doctorName: 'Doctor Name',
        doctorAvatar: 'https://i.pravatar.cc/100?img=4',
        clinicName: 'Eden Medical Center',
        clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
        price: 'SAR 20',
        status: 'Paid',
        statusColor: '#10b981',
      },
  
      // ---- Appointment ----
      {
        id: 'a1',
        kind: 'appointment',
        date: '10/02/2025',
        paymentId: 'Appt. ID',
        clinicImg: true,
        clinicName: 'Eden Medical Center',
        clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
        numberOfService: '03',
        price: 'SAR 20',
        status: 'Refund',
        statusColor: '#ef4444',
        services: [
          {
            id: 1,
            name: 'Acne Treatment',
            duration: '40 min',
            price: '200 SAR',
            category: 'Dental',
            categoryBadge: 'Enaqa Name',
            image: PipsImage,
          },
          {
            id: 2,
            name: 'Teeth Whiting',
            duration: '40 min',
            price: '200 SAR',
            category: 'Dental',
            categoryBadge: 'Group Name',
            image: PipsImage,
          },
        ],
      },
      {
        id: 'a2',
        kind: 'appointment',
        date: '10/02/2025',
        paymentId: '#23231',
        clinicImg: true,
        clinicName: 'Eden Medical Center',
        clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
        numberOfService: '03',
        price: 'SAR 20',
        status: 'Paid',
        statusColor: '#10b981',
        services: [
          {
            id: 1,
            name: 'Acne Treatment',
            duration: '40 min',
            price: '200 SAR',
            category: 'Dental',
            categoryBadge: 'Enaqa Name',
            image: PipsImage,
          },
          {
            id: 2,
            name: 'Teeth Whiting',
            duration: '40 min',
            price: '200 SAR',
            category: 'Dental',
            categoryBadge: 'Group Name',
            image: PipsImage,
          },
        ],
      },
    ];
  

// ---------- Chat Constants and Helper Functions ----------
export const DEFAULT_DOCTOR_INFO: DoctorInfo = {
  id: 'doctor_1',
  name: 'Dr. Sultan Khan',
  avatar: doctor,
  serviceName: '',
};

export const DEFAULT_CLINIC_INFO: ClinicInfo = {
  name: 'Eden Medical Center',
  location: 'Madina, Saudi Arabia, 2.2km',
  image: RecommandImage,
};

export const CONSULTATION_DURATION = 30 * 60; // 30 minutes in seconds

export function getCurrentTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

export function getInitialMessages(
  chatType: 'ai' | 'doctor',
  doctorInfo: DoctorInfo,
): Message[] {
  const timestamp = getCurrentTimestamp();

  if (chatType === 'doctor') {
    return [
      {
        id: '1',
        type: 'bot',
        text: 'Hello',
        timestamp,
        user: { name: doctorInfo.name, avatar: doctor },
      },
      {
        id: '2',
        type: 'user',
        text: "I've been having some redness and small bumps on my cheeks for past few days.",
        timestamp,
        user: { name: 'Bassil Kuncill Saadeh', avatar: patient },
      },
      {
        id: '3',
        type: 'bot',
        text: 'I recommend using a gentle cleanser and applying a hydrating cream twice daily...',
        timestamp,
        user: { name: doctorInfo.name, avatar: doctor },
        suggestions: [
          {
            id: '1',
            image: PipsImage,
            type: 'Service',
            serviceGroup: 'Acne Treatment',
            serviceName: 'Advanced Facial',
            price: '350 SAR',
            duration: '45 min',
            description: 'A multi-step facial treatment.',
            procedure: 'Uses patented device.',
          },
          {
            id: '2',
            image: PipsImage,
            type: 'Device',
            serviceGroup: 'Wood lamp',
            serviceName: 'Diagnostic',
            price: '600 SAR',
            duration: '1 hr',
            description: 'Advanced diagnostic.',
            procedure: 'Device for skin analysis.',
          },
        ],
      },
    ];
  }

  // AI Chat
  return [
    { id: '1', type: 'user', text: 'Hi!', timestamp },
    {
      id: '2',
      type: 'bot',
      text: 'Welcome! You can ask me anything or upload a photo to get suggestions.',
      timestamp,
    },
    {
      id: '3',
      type: 'user',
      text: "I've uploaded a photo. I have some redness and itching on my face.",
      timestamp,
      images: [pimples, pimples],
    },
    {
      id: '4',
      type: 'bot',
      text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
      timestamp,
      suggestions: [
        {
          id: '1',
          image: PipsImage,
          type: 'Dermatology',
          serviceGroup: 'Skin Rejuvenation',
          serviceName: 'HydraFacial Glow',
          price: '350 SAR',
          duration: '45 min',
          description: 'Deep cleansing facial.',
          procedure: 'Uses a patented device.',
        },
        {
          id: '2',
          image: PipsImage,
          type: 'Dentistry',
          serviceGroup: 'Teeth Whitening',
          serviceName: 'Laser Smile Brightening',
          price: '600 SAR',
          duration: '1 hr',
          description: 'Advanced laser teeth whitening.',
          procedure: 'Hydrogen peroxide gel with laser.',
        },
      ],
    },
  ];
}
  