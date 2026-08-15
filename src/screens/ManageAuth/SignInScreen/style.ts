import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurCircle: {
    position: 'absolute',
    top: -mvs(50),
    right: -mvs(50),
    width: mvs(320),
    height: mvs(320),
    borderRadius: mvs(160),
    backgroundColor: '#7625D7',
    opacity: 0.15,
  },
  card: {
    borderRadius: mvs(28),
    borderWidth: 1,
    paddingHorizontal: mvs(20),
    paddingVertical: mvs(25),
    marginVertical: mvs(10),
    shadowColor: '#7625D7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: mvs(5),
    marginBottom: mvs(10),
  },
  logo: {
    width: mvs(150),
    height: mvs(66),
  },
  tagline: {
    fontSize: mvs(12),
    fontWeight: '500',
    textAlign: 'center',
    marginTop: mvs(2),
    marginBottom: mvs(15),
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
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: mvs(13),
    textAlign: 'center',
    marginTop: mvs(6),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: mvs(25),
    padding: mvs(4),
    marginVertical: mvs(15),
    width: '100%',
    height: mvs(48),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRadius: mvs(21),
    gap: mvs(6),
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontWeight: '600',
    fontSize: mvs(13),
  },
  activeTabText: {
    fontWeight: '700',
  },
  label: {
    fontSize: mvs(13),
    marginBottom: mvs(8),
    fontWeight: '600',
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: mvs(15),
    gap: mvs(6),
  },
  PasswordRemember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: mvs(10),
  },
  signinLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: mvs(15),
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: mvs(12),
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
    marginBottom: mvs(5),
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
    borderRadius: mvs(12),
    paddingVertical: mvs(14),
    borderWidth: 1,
  },
  googleText: {
    fontSize: mvs(15),
    fontWeight: '600',
  },
  gradientButtonContainer: {
    width: '100%',
    marginTop: mvs(15),
    borderRadius: mvs(25),
    overflow: 'hidden',
    shadowColor: '#7625D7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  gradientButton: {
    // An explicit height, not vertical padding: react-native-linear-gradient
    // does not measure its children on the new architecture, so padding alone
    // collapses the button.
    height: mvs(50),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: mvs(15),
    fontWeight: '700',
  },
  guestButton: {
    alignSelf: 'center',
    marginTop: mvs(18),
    paddingVertical: mvs(8),
    paddingHorizontal: mvs(16),
  },
  guestButtonText: {
    fontSize: mvs(14),
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: mvs(20),
    marginBottom: mvs(10),
  },
  footerText: {
    fontSize: mvs(11),
    fontWeight: '500',
  },
  CheckBox: {
    flexDirection: 'row',
    gap: mvs(5),
    alignItems: 'center',
  },
});
