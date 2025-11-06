
import { StyleSheet } from 'react-native';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
      },
      faqItem: {
        backgroundColor: colors.dardkGray, // Light gray background
        borderRadius: 8,
        marginBottom: mvs(12),
        overflow: 'hidden',
      },
      faqContainer:{
        marginTop:mvs(20)
      },
      faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
      },
      faqQuestion: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.black,
        marginRight: 10,
      },
      faqAnswerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
      },
      faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.secondaryText, // Slightly muted text
      },
  });
  
  