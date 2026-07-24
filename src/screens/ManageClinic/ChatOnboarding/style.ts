import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0F8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  highlight: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  MainLogoContainer: {
    marginTop: 28,
    marginBottom: 20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#EBE3F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E4DBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DDD2E6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  featuresSection: {
    width: '100%',
    alignItems: 'center',
  },
  featuresTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
    width: '100%',
  },
  gradientChip: {
    borderRadius: 10,
    margin: 5,
  },
  innerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E1E1E',
  },
  button: {
    marginTop: 'auto',
    width: '100%',
    borderRadius: 16,
  },
});
