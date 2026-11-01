import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'

import { useHeadingFamily } from '@/ui/hooks/use-heading-family'

import { TRANSPARENT } from '@/ui/tokens/transparent'
import { TYPOGRAPHY_SIZE_VARIANTS } from '@/ui/tokens/theme'

export function LargeInput({ value, onChangeText, placeholder, modal, ...props }) {
    const { colors } = useTheme()
    const fontFamily = useHeadingFamily()

    const InputComponent = TextInput

    return (
        <InputComponent
            {...props}
            value={value}
            style={{
                ...styles.input,
                fontFamily,
                color: colors.onBackground
            }}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={colors.onBackground}
            selectionHandleColor={colors.accentText}
            selectionColor={colors.onBackground + TRANSPARENT[20]}
            placeholderTextColor={colors.onBackground + TRANSPARENT[40]}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flexGrow: 1,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.headlineSmall
    }
})
