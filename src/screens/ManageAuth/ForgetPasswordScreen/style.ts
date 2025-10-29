
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
  subtitle: {
    fontSize: mvs(13),
    color: colors.gray,
    textAlign: 'center',
    marginTop: mvs(6),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: mvs(25),
    backgroundColor: '#F3F3F5',
    borderRadius: mvs(10),
    padding: mvs(4),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: mvs(10),
    borderRadius: mvs(8),
  },
  activeTab: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.gray,
    fontWeight: '500',
    fontSize: mvs(13),
  },
  activeTabText: {
    color: colors.primary,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: mvs(15),
  },
  signinText: {
    color: colors.gray,
    fontSize: mvs(13),
  },
  signinLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: mvs(20),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: mvs(10),
    color: colors.gray,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: mvs(10),
    paddingVertical: mvs(12),
  },
  appleText: {
    color: colors.white,
    marginLeft: mvs(8),
    fontSize: mvs(14),
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: mvs(10),
    paddingVertical: mvs(12),
    marginTop: mvs(10),
  },
  googleText: {
    color: colors.black,
    marginLeft: mvs(8),
    fontSize: mvs(14),
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: mvs(25),
  },
  termsText: {
    flex: 1,
    marginLeft: mvs(8),
    color: colors.gray,
    fontSize: mvs(12),
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
