
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: mvs(20),
        paddingTop: mvs(10),
      },
      logoContainer: {
        alignItems: 'center',
        marginVertical: mvs(20),
      },
      title: {
        fontSize: mvs(22),
        fontWeight: '600',
        color: colors.black,
        textAlign: 'center',
      },
      content: {
        alignItems: 'center',
        gap: mvs(15),
        marginTop: mvs(6),
      },
      TextContent: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.secondaryText,
        textAlign:"center"
      },
      InputContainer:{
        marginTop:50
      }
});
