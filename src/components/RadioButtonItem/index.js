import { StyleSheet } from 'react-native'
import { RadioButton, useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function RadioButtonItem({ ...props }) {
    const { colors } = useTheme()

    return (
        <RadioButton.Item
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
        // padding: 8,
        fontFamily: FONTS.azeretLight
    }
})
