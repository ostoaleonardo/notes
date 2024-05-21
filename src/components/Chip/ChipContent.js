import { StyleSheet, View } from 'react-native'
import { Cross } from '@/icons'
import { COLORS } from '@/constants'

export function ChipContent() {
    return (
        <View style={styles.container}>
            <Cross
                width={16}
                height={16}
                color={COLORS.text}
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
        backgroundColor: COLORS.text10,
    },
})
