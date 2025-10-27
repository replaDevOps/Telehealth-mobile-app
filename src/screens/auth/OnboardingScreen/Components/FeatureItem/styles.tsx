import { StyleSheet } from 'react-native';
import { mvs } from '../../../../../config/metrices';
import { colors } from '../../../../../styles/colors';

export const styles = StyleSheet.create({
  containner: {
    flex: 1,
    gap: mvs(110),
    alignItems: 'center',
    padding: mvs(20),
  },
  image: {
    width: '80%',
    height: mvs(300),
    backgroundColor: colors.gray,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: mvs(20),
    marginTop: '30%',
  },
  title: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: mvs(15),
  },
  TextContent: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    color: colors.secondaryText,
  },
});
