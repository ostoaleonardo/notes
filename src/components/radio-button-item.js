import { StyleSheet } from 'react-native'
import { RadioButton, useTheme } from 'react-native-paper'

import { FONTS, RADIUS } from '@/constants/themes'

export function RadioButtonItem({ isFirst, isLast, ...props }) {
    const { colors } = useTheme()

    return (
        <RadioButton.Item
            position='trailing'
            style={{
                borderTopLeftRadius: isFirst ? RADIUS.outer : 0,
                borderTopRightRadius: isFirst ? RADIUS.outer : 0,
                borderBottomLeftRadius: isLast ? RADIUS.outer : 0,
                borderBottomRightRadius: isLast ? RADIUS.outer : 0
            }}
            labelStyle={{
                ...styles.title,
                ...props.styles
            }}
            color={colors.onBackground}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        paddingHorizontal: 16,
        fontFamily: FONTS.azeretLight
    }
})
