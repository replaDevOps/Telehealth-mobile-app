 import { StyleSheet } from 'react-native';
 import { colors } from '../../../styles/colors';
 import { mvs } from '../../../config/metrices';
 
 export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: mvs(10),
    fontSize: 16,
    color: colors.secondaryText,
  },
  locationInfo: {
    position: 'absolute',
    bottom: mvs(20),
    left: mvs(15),
    right: mvs(15),
    backgroundColor: colors.white,
    padding: mvs(12),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfoText: {
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
 },
 });
 