import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '@/constants'

export function Message({ label }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        opacity: 0.5,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
