import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    contentContainer: {
        paddingHorizontal: mvs(20),
        paddingTop: mvs(20),
    },
    sectionTitle: {
        fontSize: mvs(16),
        fontWeight: '700',
        color: colors.black,
        marginBottom: mvs(8),
    },
    description: {
        fontSize: mvs(14),
        color: '#4F4F4F',
        lineHeight: mvs(22),
        marginBottom: mvs(16),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: mvs(14),
        color: colors.red,
        marginBottom: mvs(16),
    },

});