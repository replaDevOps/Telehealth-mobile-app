import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomColor: colors.border,
      },
      clinicLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      clinicImage: {
        width: 48,
        height: 48,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        marginRight: 12,
      },
      clinicName: {
        fontSize: 15,
        fontWeight: '600',
        color:colors.secondaryText,
      },
      clinicLocation: {
        fontSize: 11,
        color: colors.secondaryText,
      
        marginTop: 2,
      },
      consultButton: {
        backgroundColor: colors.black,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth:1,
        borderColor:colors.border
      },
      consultButtonText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
      },
      resonSection:{marginTop:16,borderTopColor:colors.border,borderTopWidth:1,padding:16},
    textInputContainer: {
        position: 'relative',
        backgroundColor: colors.gray || '#f5f5f5',
        borderRadius: 12,
        minHeight: 100,
        marginBottom: 16,
      },
       textInput: { padding: 16, fontSize: 14, color: colors.text, minHeight: 100 },
      charCount: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        fontSize: 12,
        color: colors.secondaryText || '#888',
      },
    
  feedbackLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  mainSection:{flex:1,padding:16},
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    // marginHorizontal: 16,
    backgroundColor: colors.lightGray,
    marginTop: 12,
    borderRadius: 12,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  nameBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nameBadgeText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 12,
  },

  duration: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  refundInstruction:{
    backgroundColor:"#EBAD0033",
    borderWidth:1,
    borderColor:colors.yellow,
    padding:8
  },
  bottomButtonContainer:{
    padding: 16,
    backgroundColor: '#fff',
    position:"absolute",
    bottom:10,
    width:"100%"
  },
  serviceRight:{
    alignItems:"center",
    gap:15
  
  
  }
  });