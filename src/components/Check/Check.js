import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Check as CheckIcon } from '@/icons'

export function Check({ checked }) {
    const { colors } = useTheme()
    const containerStyle = checked
        ? [
            styles.checkedContainer,
            { backgroundColor: colors.onBackground }
        ] : [
            styles.uncheckedContainer,
            { borderColor: colors.onBackground + '33' }
        ]

    return (
        <View style={[styles.base, containerStyle]}>
            {checked &&
                <CheckIcon
                    width={16}
                    height={16}
                    color={colors.background}
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        width: 24,
        height: 24,
        borderRadius: 12
    },
    checkedContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    uncheckedContainer: {
        borderWidth: 2
    }
})
