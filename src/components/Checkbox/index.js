import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Check } from '@/icons'
import { TRANSPARENT } from '@/constants'

export function Checkbox({ checked }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    const backgroundColor = checked ? onBackground : TRANSPARENT.color
    const borderColor = checked ? onBackground : onBackground + TRANSPARENT[20]

    return (
        <View
            style={{
                ...styles.check,
                backgroundColor,
                borderColor
            }}
        >
            {checked && (
                <Check
                    width={20}
                    height={20}
                    color={background}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    check: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
