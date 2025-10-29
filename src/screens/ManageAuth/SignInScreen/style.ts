
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CheckBox } from '@rneui/base';

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
  logo: {
    width: mvs(120),
    height: mvs(60),
  },
  title: {
    alignItems: 'center',
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
  },
  subtitle: {
    fontSize: mvs(13),
    textAlign: 'center',
    marginTop: mvs(6),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: mvs(25),
    backgroundColor: colors.gray,
    borderRadius: mvs(12),
    padding: mvs(5),
    width: '80%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: mvs(12),
    borderRadius: mvs(10),
  },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: '500',
    fontSize: mvs(13),
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  label: {
    fontSize: mvs(13),
    marginBottom: mvs(8),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(12),
    paddingHorizontal: mvs(14),
    paddingVertical: mvs(12),
    backgroundColor: '#F8F8FA',
    fontSize: mvs(14),
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:"center"
  },
  PasswordRemember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:"center"
  },
  signinText: {
    color: colors.gray,
    fontSize: mvs(13),
  },
  signinLink: {
    color: colors.primary,
    fontWeight:"700",
    marginLeft: mvs(4),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: mvs(25),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: mvs(12),
    color: colors.gray,
    fontSize: mvs(13),
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: mvs(12),
    paddingVertical: mvs(14),
    marginTop: mvs(10),
  },
  appleText: {
    color: colors.white,
    marginLeft: mvs(10),
    fontSize: mvs(15),
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: mvs(12),
    paddingVertical: mvs(14),
    marginTop: mvs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleText: {
    marginLeft: mvs(10),
    fontSize: mvs(15),
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    marginTop: mvs(20),
    marginBottom: mvs(15),
    gap: 10,
  },
  termsText: {
    flex: 1,
    marginLeft: mvs(10),
    color: colors.gray,
    fontSize: mvs(12),
    lineHeight: mvs(18),
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  CheckBox:{ flexDirection: 'row', gap: mvs(5), alignItems: 'center' }
});
