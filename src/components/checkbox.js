import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Check } from '@/icons/check'

import { TRANSPARENT } from '@/constants/themes'

export function Checkbox({ checked }) {
    const { colors } = useTheme()

    const backgroundColor = checked ? colors.onBackground : TRANSPARENT.color
    const borderColor = checked ? colors.onBackground : colors.onBackground + TRANSPARENT[20]

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
                    color={colors.background}
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
