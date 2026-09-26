import { StyleSheet } from 'react-native'
import { RadioButton, useTheme } from 'react-native-paper'

import { FONTS } from '@/constants/fonts'
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
        fontSize: 14,
        paddingHorizontal: 16,
        fontFamily: FONTS.azeretLight
    }
})
