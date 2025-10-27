import { StyleSheet } from 'react-native';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: mvs(20),
    justifyContent: 'space-around',
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
  subtitle: {
    fontSize: mvs(13),
    textAlign: 'center',
    color: colors.border,
    marginTop: mvs(5),
    marginBottom: mvs(25),
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: mvs(40),
    marginTop: mvs(30),
    marginHorizontal: mvs(10),
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.gray,
    borderRadius: mvs(12),
    paddingVertical: mvs(15),
    paddingHorizontal: mvs(10),
  },
  activeLangOption: {
    borderColor: colors.primary,
    backgroundColor: '#F2EDFF',
  },
  radioOuter: {
    width: mvs(18),
    height: mvs(18),
    borderRadius: mvs(9),
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: mvs(10),
    height: mvs(10),
    borderRadius: mvs(5),
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: mvs(14),
    fontWeight: '500',
    color: colors.black,
  },
  flag: {
    width: mvs(20),
    height: mvs(20),
    borderRadius: mvs(4),
  },
});
