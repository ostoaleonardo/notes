import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function LargeInput({ value, onChangeText, placeholder, modal, ...props }) {
    const { colors } = useTheme()

    const InputComponent = TextInput

    return (
        <InputComponent
            {...props}
            value={value}
            style={{
                ...styles.input,
                color: colors.onBackground
            }}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={colors.onBackground}
            selectionHandleColor={colors.tertiary}
            selectionColor={colors.onBackground + TRANSPARENT[20]}
            placeholderTextColor={colors.onBackground + TRANSPARENT[40]}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flexGrow: 1,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.title,
        fontFamily: FONTS.nType82Headline
    }
})
