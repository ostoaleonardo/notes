import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Cross } from '@/icons'

export function ChipContent() {
    const { colors } = useTheme()

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.onSurface }
            ]}
        >
            <Cross
                width={16}
                height={16}
                color={colors.surface}
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
        justifyContent: 'center'
    }
})
