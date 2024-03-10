import { StyleSheet, View } from 'react-native'
import { Cross } from '@/icons'
import { colors, fonts } from '@/constants'

export function ChipContent() {
    return (
        <View style={styles.container}>
            <Cross
                width={16}
                height={16}
                color={colors.text}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 16,
        height: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text15,
    },
    text: {
        fontSize: 8,
        color: colors.text,
        fontWeight: 'bold',
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
        transform: [{ rotate: '45deg' }],
    },
})
