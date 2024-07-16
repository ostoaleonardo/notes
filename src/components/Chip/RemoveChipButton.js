import { Pressable, StyleSheet } from 'react-native'
import { Cross } from '@/icons'
import { useTheme } from 'react-native-paper'

export function RemoveChipButton({ onPress }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                { backgroundColor: colors.background + '26' }
            ]}
        >
            <Cross
                width={16}
                height={16}
                rotation={45}
                color={colors.background}
            />
        </Pressable>
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
