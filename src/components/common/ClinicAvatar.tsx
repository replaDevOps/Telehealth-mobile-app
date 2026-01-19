import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../styles/colors';

interface ClinicAvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const ClinicAvatar: React.FC<ClinicAvatarProps> = ({
    name,
    size = 50,
    style,
    textStyle
}) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
    };

    const initials = getInitials(name);

    return (
        <View style={[
            styles.container,
            { width: size, height: size, borderRadius: size / 2 },
            style
        ]}>
            <Text style={[
                styles.text,
                { fontSize: size * 0.4 },
                textStyle
            ]}>
                {initials}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: colors.white,
        fontWeight: 'bold',
    },
});

export default ClinicAvatar;
