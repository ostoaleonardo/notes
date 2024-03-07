import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '../../constants'

export function SquareButton({ onPress, label }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            <Text style={styles.label}>
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 72,
        height: 72,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    label: {
        fontSize: 12,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
})
