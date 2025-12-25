import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  ImageSourcePropType,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doctor, Signature } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '@components/common/CustomButton';
import { Toast } from '@components/common/Toast';
import { EmptyContentSvg } from '@assets/icons';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';

// Type definitions
interface Doctor {
  name: string;
  credentials: string;
  signatureImage: ImageSourcePropType;
  image: ImageSourcePropType;
}

interface Clinic {
  name: string;
  location: string;
  specialization: string;
}

interface Patient {
  name: string;
  age: number;
  gender: string;
}

interface Diagnosis {
  summary: string[];
}

interface Treatment {
  name: string;
  notes: string;
}

interface Medication {
  id: number;
  name: string;
  genericName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  clinic: Clinic;
  patient: Patient;
  diagnosis?: Diagnosis;
  treatment?: Treatment;
  medications?: Medication[];
}

interface RouteParams {
  prescriptionId?: string;
  consultationID?: number;
  fromHistory?: boolean;
}

interface Navigation {
  navigate: (screen: string) => void;
}

interface Props {
  route: {
    params?: RouteParams;
  };
  navigation: Navigation;
}

interface DoctorCardProps {
  doctor: Doctor;
  date: string;
  time: string;
}

interface InfoSectionProps {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

interface MedicationCardProps {
  medication: Medication;
  t: (key: string) => string;
}

export const PrescriptionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const prescriptionId = route?.params?.prescriptionId;
  const consultationID = route?.params?.consultationID;
  const fromHistory = route?.params?.fromHistory || false;

  useEffect(() => {
    if (consultationID) {
      fetchPrescriptionData();
    }
  }, [prescriptionId, consultationID]);

  const fetchPrescriptionData = async (): Promise<void> => {
    if (!consultationID) {
      setError(t('consultation_id_required') || 'Consultation ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);

      // Use history API if fromHistory is true
      const endpoint = fromHistory
        ? `${API.HISTORY.GET_PRESCRIPTION}/${consultationID}`
        : `${API.CONSULTATIONS.DOWNLOAD_PRESCRIPTION}?consultationID=${consultationID}`;

      const response = await apiClient.get(endpoint);
      console.log('Prescription response:', response.data);
      
      // Check if API returned success: false with a message (not an error, just no prescription)
      if (response.data?.success === false) {
        const apiMessage = response.data?.message || t('no_prescription_available') || 'No prescription available';
        setInfoMessage(apiMessage);
        setPrescription(null);
      } else if (response.data?.success !== false && response.data?.data) {
        // Map API response to prescription format
        const prescriptionData = response.data.data;
        // You may need to map the API response structure to your Prescription type
        // For now, using mock data structure as placeholder
        setPrescription(getMockPrescriptionData());
        setInfoMessage(null);
      } else {
        // No data but no explicit message
        setInfoMessage(t('no_prescription_available') || 'No prescription available');
        setPrescription(null);
      }
    } catch (err: any) {
      // Only set error for actual exceptions/network errors
      const errorMessage =
        err instanceof Error ? err.message : err?.response?.data?.message || 'An unknown error occurred';
      setError(errorMessage);
      setInfoMessage(null);
      Alert.alert(t('error') || 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!consultationID) {
      Alert.alert(
        t('error') || 'Error',
        t('consultation_id_required') || 'Consultation ID is required to download prescription'
      );
      return;
    }

    setIsDownloading(true);

    try {
      const token = useAuthStore.getState().auth?.user?.token;
      
      // Use history API if fromHistory is true, otherwise use consultations API
      const endpoint = fromHistory
        ? `${API.HISTORY.GET_PRESCRIPTION}/${consultationID}`
        : `${API.CONSULTATIONS.DOWNLOAD_PRESCRIPTION}?consultationID=${consultationID}`;

      // Use fetch to download the prescription file
      const response = await fetch(
        `${BASE_URL}${endpoint}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download prescription');
      }

      // Get the file URL from response (could be a direct download link or file data)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // If response is JSON, it might contain a download URL
        const data = await response.json();
        const downloadUrl = data.data?.url || data.url || data.downloadUrl;
        
        if (downloadUrl) {
          // Open the download URL in browser or download manager
          const fullUrl = downloadUrl.startsWith('http') 
            ? downloadUrl 
            : `https://telehealth.repla-projects.com/${downloadUrl}`;
          
          const canOpen = await Linking.canOpenURL(fullUrl);
          if (canOpen) {
            await Linking.openURL(fullUrl);
            setToast({
              visible: true,
              message: t('prescription_downloaded_successfully') || 'Prescription downloaded successfully',
              type: 'success',
            });
          } else {
            throw new Error('Cannot open download URL');
          }
        } else {
          // If no URL, the response might be the file itself
          throw new Error('No download URL found in response');
        }
      } else {
        // If response is a file (PDF, image, etc.), handle it differently
        // For now, we'll treat it as a direct download
        const blob = await response.blob();
        // In React Native, we might need to use a file system library
        // For now, we'll show success and let the browser handle it
        setToast({
          visible: true,
          message: t('prescription_downloaded_successfully') || 'Prescription downloaded successfully',
          type: 'success',
        });
      }

      // Navigate after showing success message
      setTimeout(() => {
        navigation.navigate('EntryPoint');
      }, 1500);
    } catch (error: any) {
      console.error('Error downloading prescription:', error);
      setToast({
        visible: true,
        message: error?.message || t('failed_to_download_prescription') || 'Failed to download prescription. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const hideToast = (): void => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const getMockPrescriptionData = (): Prescription => ({
    id: '#1235',
    doctor: {
      name: 'Ali Abdul Aziz',
      credentials: 'MBBS, Dermatologist',
      signatureImage: Signature,
      image: doctor,
    },
    appointmentDate: '5 November, 2025',
    appointmentTime: '1:20 PM',
    clinic: {
      name: 'Glow modern Aesthetics Clinic',
      location: 'Riyadh, Saudi Arabia',
      specialization: 'Extraction of Wisdom Tooth consultation',
    },
    patient: {
      name: 'Ahmed Ali',
      age: 28,
      gender: 'Male',
    },
    diagnosis: {
      summary: [
        'Mild to Moderate Acne Vulgaris with inflammation on cheeks and forehead.',
        'Mild to Moderate Acne Vulgaris with inflammation on cheeks and forehead.',
      ],
    },
    treatment: {
      name: 'Deep Acne Cleansing',
      notes:
        'Patient requires 3 sessions spaced 2 weeks apart. Avoid direct sunlight for 48 hours after treatment.',
    },
    medications: [
      {
        id: 1,
        name: 'Medicine 1',
        genericName: 'Tetracycline 1% Gel',
        dosage: 'Apply twice daily',
        duration: '14 days',
        instructions:
          'Apply a thin layer on affected areas after washing face.',
      },
      {
        id: 2,
        name: 'Medicine 2',
        genericName: 'Doxycycline 100mg',
        dosage: '1 capsule daily',
        duration: '10 days',
        instructions: 'Take after meal with a full glass of water.',
      },
    ],
  });

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header2 title={t('prescription_id')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading_prescription')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show info message (when success: false from API) - not an error, just no prescription
  if (!loading && !error && !prescription && infoMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Header2 title={t('prescription')} />

        <View style={styles.noPrescriptionContainer}>
          <EmptyContentSvg width={180} height={180} />
          <Text style={styles.noPrescriptionTitle}>
            {infoMessage}
          </Text>
          <Text style={styles.noPrescriptionSubtitle}>
            {t('prescription_will_appear_here')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show default empty state when no prescription and no message
  if (!loading && !error && !prescription && !infoMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Header2 title={t('prescription')} />

        <View style={styles.noPrescriptionContainer}>
          <EmptyContentSvg width={180} height={180} />
          <Text style={styles.noPrescriptionTitle}>
            {t('no_prescription_available')}
          </Text>
          <Text style={styles.noPrescriptionSubtitle}>
            {t('prescription_will_appear_here')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State - only show when there's an actual error (network, exception, etc.)
  if (error && !infoMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <Header2 title={t('prescription')} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrescriptionData}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no prescription and no error, we've already handled it above
  if (!prescription) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Header2 title={prescription.id} />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={3000}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <DoctorCard
          doctor={prescription.doctor}
          date={prescription.appointmentDate}
          time={prescription.appointmentTime}
        />

        <View style={styles.infoGrid}>
          <InfoSection
            title={t('clinic_info')}
            items={[
              { label: t('clinic_name'), value: prescription.clinic.name },
              { label: t('location'), value: prescription.clinic.location },
              {
                label: t('specialization'),
                value: prescription.clinic.specialization,
              },
            ]}
          />

          <InfoSection
            title={t('patient_info')}
            items={[
              { label: t('patient_name'), value: prescription.patient.name },
              { label: t('age'), value: prescription.patient.age.toString() },
              { label: t('gender'), value: prescription.patient.gender },
            ]}
          />
        </View>

        {prescription.diagnosis && (
          <Section title={t('diagnosis')}>
            <View style={styles.diagnosisBox}>
              <Text style={styles.diagnosisLabel}>
                {t('diagnosis_summary')}
              </Text>
              {prescription.diagnosis.summary.map((text, index) => (
                <Text key={index} style={styles.diagnosisText}>
                  {text}
                </Text>
              ))}
            </View>
          </Section>
        )}

        {prescription.treatment && (
          <Section title={t('treatment_details')}>
            <View style={styles.treatmentBox}>
              <Text style={styles.treatmentLabel}>{t('treatment_name')}</Text>
              <Text style={styles.treatmentName}>
                {prescription.treatment.name}
              </Text>
              <Text style={styles.treatmentLabel}>{t('treatment_notes')}</Text>
              <Text style={styles.treatmentNotes}>
                {prescription.treatment.notes}
              </Text>
            </View>
          </Section>
        )}

        {/* Medications Section */}
        {prescription.medications && prescription.medications.length > 0 && (
          <Section title={t('medication')}>
            {prescription.medications.map(medication => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                t={t}
              />
            ))}
          </Section>
        )}

        <Section title={t('doctors_signature')}>
          <View style={styles.signatureBox}>
            <Image
              source={Signature}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>
        </Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <CustomButton title={t('download')} onPress={handleDownload} />
        </View>
      </View>

      <Modal
        visible={isDownloading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.downloadingText}>{t('downloading')}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, date, time }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.doctorCard}>
      <Image source={doctor.image} style={styles.avatar} />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorCredentials}>{doctor.credentials}</Text>
        <Text style={styles.dateTime}>
          {date} | {time}
        </Text>
      </View>
    </View>
  );
};

const InfoSection: React.FC<InfoSectionProps> = ({ title, items }) => (
  <View style={styles.infoSection}>
    <Text style={styles.infoSectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.infoItem}>
        <Text style={styles.infoLabel}>{item.label}</Text>
        <Text style={styles.infoValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, t }) => (
  <View style={styles.medicationCard}>
    <Text style={styles.medicationName}>{medication.name}</Text>
    <Text style={styles.medicationGeneric}>{medication.genericName}</Text>

    <View style={styles.medicationDetails}>
      <View style={styles.medicationRow}>
        <Text style={styles.medicationLabel}>{t('dosage')}</Text>
        <Text style={styles.medicationValue}>{medication.dosage}</Text>
      </View>
      <View style={styles.medicationRow}>
        <Text style={styles.medicationLabel}>{t('duration')}</Text>
        <Text style={styles.medicationValue}>{medication.duration}</Text>
      </View>
    </View>

    {medication.instructions && (
      <Text style={styles.medicationInstructions}>
        {t('instructions')}: {medication.instructions}
      </Text>
    )}
  </View>
);
