import { StyleSheet } from 'react-native'
import { RadioButton, useTheme } from 'react-native-paper'
import { COMMONS, FONTS } from '@/constants'

export function RadioButtonItem({ isFirst, isLast, ...props }) {
    const { colors } = useTheme()

    return (
        <RadioButton.Item
            position='trailing'
            style={{
                borderTopLeftRadius: isFirst ? COMMONS.radius : 0,
                borderTopRightRadius: isFirst ? COMMONS.radius : 0,
                borderBottomLeftRadius: isLast ? COMMONS.radius : 0,
                borderBottomRightRadius: isLast ? COMMONS.radius : 0
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
