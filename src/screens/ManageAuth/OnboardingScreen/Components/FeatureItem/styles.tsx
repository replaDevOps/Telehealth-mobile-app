import { StyleSheet } from 'react-native';
import { mvs } from '../../../../../config/metrices';
import { colors } from '../../../../../styles/colors';

export const styles = StyleSheet.create({
  containner: {
    marginBottom: mvs(50),
  },
  image: {
    width: '100%',
    height: mvs(400),
    alignSelf: 'center',
    resizeMode: 'cover',
    position: 'relative',
    bottom: mvs(50),
  },
  title: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: mvs(15),
    marginHorizontal: mvs(20),
    marginBottom: mvs(20),
  },
  TextContent: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    color: colors.secondaryText,
  },
});
