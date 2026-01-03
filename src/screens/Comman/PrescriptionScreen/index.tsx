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
  Share,
  Platform,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
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

      // Use history endpoint for both active and history consultations (returns JSON data)
      // DOWNLOAD_PRESCRIPTION returns PDF, so we use GET_PRESCRIPTION which returns JSON
      const endpoint = `${API.HISTORY.GET_PRESCRIPTION}/${consultationID}`;

      const response = await apiClient.get(endpoint);
      console.log('Prescription response:', response.data);
      
      // Check if API returned success: false with a message (not an error, just no prescription)
      if (response.data?.success === false) {
        const apiMessage = response.data?.message || t('no_prescription_available') || 'No prescription available';
        setInfoMessage(apiMessage);
        setPrescription(null);
      } else if (response.data?.success !== false) {
        // API response structure: { success: true, prescriptions: [...], clinic: {...}, doctor: {...}, service: {...}, patient: {...} }
        const apiData = response.data;
        
        // Check if prescriptions array exists and has data
        if (!apiData.prescriptions || (Array.isArray(apiData.prescriptions) && apiData.prescriptions.length === 0)) {
          setInfoMessage(t('no_prescription_available') || 'No prescription available');
          setPrescription(null);
          return;
        }

        // Map API response to prescription format
        const mappedPrescription = mapApiResponseToPrescription(apiData);
        setPrescription(mappedPrescription);
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
      // Always use history endpoint which returns JSON data (not PDF)
      // DOWNLOAD_PRESCRIPTION returns PDF, so we use GET_PRESCRIPTION which returns JSON
      const endpoint = `${API.HISTORY.GET_PRESCRIPTION}/${consultationID}`;

      // Fetch prescription data as JSON
      const response = await apiClient.get(endpoint);
      const responseData = response.data;
      
      // Check if response contains prescription data to generate PDF
      if (responseData?.success !== false && responseData?.prescriptions && Array.isArray(responseData.prescriptions) && responseData.prescriptions.length > 0) {
        // If the response contains prescription data, generate and save as PDF
        try {
          await generateAndSavePDF(responseData);
          setToast({
            visible: true,
            message: t('prescription_saved_successfully') || 'Prescription saved as PDF successfully',
            type: 'success',
          });
        } catch (pdfError: any) {
          console.error('PDF generation error:', pdfError);
          // Fallback to sharing as text if PDF generation fails
          try {
            await sharePrescriptionAsText(responseData);
          } catch (shareError: any) {
            console.log('Share error:', shareError);
            setToast({
              visible: true,
              message: t('prescription_available') || 'Prescription is available on screen',
              type: 'success',
            });
          }
        }
      } else {
        // If no prescription data, show error
        throw new Error(t('no_prescription_data_found') || 'No prescription data found');
      }

      // Don't navigate automatically - let user stay on the prescription screen
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

  // Generate HTML content for PDF
  const generatePrescriptionHTML = (apiData: any): string => {
    const prescriptions = apiData.prescriptions || [];
    const clinic = apiData.clinic || {};
    const doctor = apiData.doctor || {};
    const patient = apiData.patient || {};
    const service = apiData.service || {};
    const prescriptionConsultationID = apiData.id || consultationID || 'N/A';

    // Format date
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch (e) {
        return dateStr;
      }
    };

    const formatTime = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return '';
      }
    };

    const firstPrescription = prescriptions[0];
    const appointmentDate = formatDate(firstPrescription?.created_at || '');
    const appointmentTime = formatTime(firstPrescription?.created_at || '');

    // Build doctor credentials
    const credentials = [
      doctor.qualification,
      doctor.specialization,
    ].filter(Boolean).join(', ') || 'Doctor';

    // Build medications HTML
    let medicationsHTML = '';
    prescriptions.forEach((prescription: any) => {
      let duration = '';
      if (prescription.startDate && prescription.endDate) {
        try {
          const start = new Date(prescription.startDate);
          const end = new Date(prescription.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          duration = diffDays === 0 ? '1 day' : `${diffDays + 1} days`;
        } catch (e) {
          duration = prescription.endDate || '';
        }
      }

      medicationsHTML += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${prescription.name || 'N/A'}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Description:</strong> ${prescription.description || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Start Date:</strong> ${prescription.startDate || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>End Date:</strong> ${prescription.endDate || 'N/A'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Duration:</strong> ${duration}</p>
        </div>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prescription #${consultationID}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
              margin-bottom: 5px;
            }
            .info-value {
              color: #333;
            }
            .signature {
              text-align: right;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prescription #${prescriptionConsultationID}</h1>
            <p>${appointmentDate} | ${appointmentTime}</p>
          </div>

          <div class="section">
            <div class="info-grid">
              <div>
                <h3 class="section-title">Clinic Information</h3>
                <div class="info-item">
                  <div class="info-label">Clinic Name:</div>
                  <div class="info-value">${clinic.clinicName || clinic.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Location:</div>
                  <div class="info-value">${clinic.location || clinic.city || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Specialization:</div>
                  <div class="info-value">${service.serviceType || service.name || 'N/A'}</div>
                </div>
              </div>

              <div>
                <h3 class="section-title">Patient Information</h3>
                <div class="info-item">
                  <div class="info-label">Patient Name:</div>
                  <div class="info-value">${patient.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Age:</div>
                  <div class="info-value">${patient.age || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Gender:</div>
                  <div class="info-value">${patient.gender || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Doctor Information</h3>
            <p><strong>Name:</strong> ${doctor.name || 'N/A'}</p>
            <p><strong>Credentials:</strong> ${credentials}</p>
          </div>

          ${service.name ? `
          <div class="section">
            <h3 class="section-title">Treatment Details</h3>
            <p><strong>Treatment Name:</strong> ${service.name}</p>
            <p><strong>Description:</strong> ${service.description || service.procedure || 'N/A'}</p>
          </div>
          ` : ''}

          <div class="section">
            <h3 class="section-title">Medications</h3>
            ${medicationsHTML || '<p>No medications prescribed.</p>'}
          </div>

          <div class="signature">
            <p><strong>Doctor's Signature</strong></p>
            ${doctor.signature ? `<img src="${doctor.signature}" alt="Doctor Signature" style="max-width: 200px; height: auto;" />` : '<p>_________________</p>'}
          </div>
        </body>
      </html>
    `;

    return html;
  };

  // Generate and save PDF
  const generateAndSavePDF = async (apiData: any): Promise<void> => {
    if (!prescription) {
      throw new Error('No prescription data available');
    }

    const htmlContent = generatePrescriptionHTML(apiData);

    try {
      // Determine the download directory based on platform
      let downloadDir = '';
      let fileName = `Prescription_${consultationID || Date.now()}.pdf`;

      if (Platform.OS === 'android') {
        // For Android, save to Downloads folder
        downloadDir = RNFS.DownloadDirectoryPath;
      } else {
        // For iOS, save to Documents directory
        downloadDir = RNFS.DocumentDirectoryPath;
      } 
      console.log('Download directory:', downloadDir);

      // Generate PDF from HTML
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: Platform.OS === 'ios' ? 'Documents' : downloadDir,
        base64: false,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', file.filePath);

      // For Android, ensure the file is in the Downloads folder
      if (Platform.OS === 'android' && file.filePath) {
        const finalPath = `${downloadDir}/${fileName}`;
        // Move file to Downloads if it's not already there
        if (file.filePath !== finalPath) {
          await RNFS.moveFile(file.filePath, finalPath);
          console.log('PDF moved to Downloads:', finalPath);
        }
      }

      // Don't open Share dialog or Linking - just save the file
      setToast({
        visible: true,
        message: t('prescription_saved_successfully') || `Prescription saved as PDF successfully\nLocation: ${Platform.OS === 'android' ? 'Downloads' : 'Documents'}`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      // If PDF generation fails, try to share as text
      throw error;
    }
  };

  // Fallback: Share prescription as text
  const sharePrescriptionAsText = async (apiData: any): Promise<void> => {
    const prescriptions = apiData.prescriptions || [];
    const clinic = apiData.clinic || {};
    const doctor = apiData.doctor || {};
    
    let shareMessage = `Prescription Details\n\n`;
    shareMessage += `Clinic: ${clinic.clinicName || clinic.name || 'N/A'}\n`;
    shareMessage += `Doctor: ${doctor.name || 'N/A'}\n`;
    shareMessage += `Date: ${new Date().toLocaleDateString()}\n\n`;
    shareMessage += `Medications:\n`;
    
    prescriptions.forEach((prescription: any, index: number) => {
      shareMessage += `${index + 1}. ${prescription.name || 'N/A'}\n`;
      shareMessage += `   Description: ${prescription.description || 'N/A'}\n`;
      shareMessage += `   Start Date: ${prescription.startDate || 'N/A'}\n`;
      shareMessage += `   End Date: ${prescription.endDate || 'N/A'}\n\n`;
    });
    
    const result = await Share.share({
      message: shareMessage,
      title: t('prescription') || 'Prescription',
    });
    
    if (result.action === Share.sharedAction) {
      setToast({
        visible: true,
        message: t('prescription_shared_successfully') || 'Prescription shared successfully',
        type: 'success',
      });
    }
  };

  // Map API response to Prescription format
  const mapApiResponseToPrescription = (apiData: any): Prescription => {
    // Format date from ISO string to readable format
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch (e) {
        return dateStr;
      }
    };

    // Format time from ISO string
    const formatTime = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return '';
      }
    };

    // Get the first prescription's created_at for appointment date/time
    const firstPrescription = apiData.prescriptions?.[0];
    const appointmentDateStr = firstPrescription?.created_at || apiData.created_at || '';
    
    // Map medications from prescriptions array
    const medications: Medication[] = (apiData.prescriptions || []).map((prescription: any, index: number) => {
      // Calculate duration from startDate to endDate
      let duration = '';
      if (prescription.startDate && prescription.endDate) {
        try {
          const start = new Date(prescription.startDate);
          const end = new Date(prescription.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          duration = diffDays === 0 ? '1 day' : `${diffDays + 1} days`;
        } catch (e) {
          duration = prescription.endDate || '';
        }
      }

      return {
        id: prescription.id || index + 1,
        name: prescription.name || '',
        genericName: prescription.name || '', // API doesn't provide generic name, use name
        dosage: prescription.description || '', // Use description as dosage/instructions
        duration: duration,
        instructions: prescription.description || '',
      };
    });

    // Map doctor data
    const doctorData = apiData.doctor || {};
    const doctorImage = doctorData.image 
      ? { uri: doctorData.image } 
      : doctor;
    const signatureImage = doctorData.signature
      ? { uri: doctorData.signature }
      : Signature;

    // Build doctor credentials from qualification and specialization
    const credentials = [
      doctorData.qualification,
      doctorData.specialization,
    ].filter(Boolean).join(', ') || 'Doctor';

    // Map clinic data
    const clinicData = apiData.clinic || {};
    
    // Map service to treatment
    const serviceData = apiData.service || {};
    const treatment = serviceData.name ? {
      name: serviceData.name || '',
      notes: serviceData.description || serviceData.procedure || '',
    } : undefined;

    // Map patient data
    const patientData = apiData.patient || {};

    return {
      id: `#${consultationID || 'N/A'}`,
      doctor: {
        name: doctorData.name || '',
        credentials: credentials,
        signatureImage: signatureImage,
        image: doctorImage,
      },
      appointmentDate: formatDate(appointmentDateStr),
      appointmentTime: formatTime(appointmentDateStr),
      clinic: {
        name: clinicData.clinicName || clinicData.name || '',
        location: clinicData.location || clinicData.city || '',
        specialization: serviceData.name || serviceData.serviceType || '',
      },
      patient: {
        name: patientData.name || '',
        age: parseInt(patientData.age || '0', 10),
        gender: patientData.gender || '',
      },
      diagnosis: undefined, // API doesn't provide diagnosis
      treatment: treatment,
      medications: medications,
    };
  };

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
              source={prescription.doctor.signatureImage}
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
