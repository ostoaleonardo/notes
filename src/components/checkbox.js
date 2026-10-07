import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Check } from '@/icons/check'

import { TRANSPARENT } from '@/constants/themes'
import { CHECKBOX } from '@/constants/components'
import { BORDER_WIDTH } from '@/constants/theme'

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
                    width={CHECKBOX.size}
                    height={CHECKBOX.size}
                    color={colors.background}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    check: {
        width: CHECKBOX.size,
        height: CHECKBOX.size,
        borderWidth: BORDER_WIDTH.thin,
        borderRadius: CHECKBOX.radius,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
