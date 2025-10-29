import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: mvs(20),
    justifyContent: 'space-around',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 40,
    color: colors.white,
    fontFamily: 'DMSans-Bold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'DMSans-Bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'green',
    height: '100%',
    borderWidth: 2,
    borderColor: 'black',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: colors.black,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: colors.black,
    textAlign: 'center',
    marginTop: 10,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 40,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
export { styles };
