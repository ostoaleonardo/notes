import { StyleSheet } from 'react-native'
import { RadioButton, useTheme } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS, SPACING } from '@/constants/theme'
import { getGroupedRadius } from '@/utils/grouped-card-style'

export function RadioButtonItem({ isFirst, isLast, ...props }) {
    const { colors } = useTheme()

    return (
        <RadioButton.Item
            position='trailing'
            style={getGroupedRadius(isFirst, isLast)}
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
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.paragraph,
        paddingHorizontal: SPACING.lg,
        fontFamily: FONTS.azeretLight
    }
})
