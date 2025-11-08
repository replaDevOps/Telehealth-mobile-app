import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';
export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    servicesContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    servicesList: {
      marginTop: 16,
    },
    tabContent: {
      padding: 16,
      minHeight: 200,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 40,
    },
    chatButtonContainer: {
      backgroundColor: colors.white,
      padding: 20,
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center',
      width: '100%',
    },
    chatButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    chatButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    reviewsContent: {
      flex: 1,
      padding: 16,
      marginBottom: 16,
    },
    reviewsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    reviewsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      gap: 4,
    },
    sortText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    reviewsList: {
      gap: 12,
    },
    reviewCard: {
      backgroundColor: '#F9F9F9',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#EEE',
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    authorName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    reviewDate: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    ratingContainer: {
      flexDirection: 'row',
      gap: 2,
      marginBottom: 8,
    },
    reviewText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    readMore: {
      color: colors.primary,
      fontWeight: '500',
      marginTop: 4,
      fontSize: 14,
    },
    aboutContent: {
      padding: 16,
    },
  
    descriptionText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.text,
      textAlign: 'left',
    },
    devicesScroll: {
      paddingRight: 16,
      gap: 12,
    },
  });