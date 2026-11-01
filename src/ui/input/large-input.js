import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'

import { FilledTextField } from '@/ui/input/filled-text-field'
import { PlainTextField } from '@/ui/input/plain-text-field'
import { useHeadingFamily } from '@/ui/hooks/use-heading-family'

import { TINT } from '@/ui/tokens/transparent'
import { TYPOGRAPHY_SIZE_VARIANTS } from '@/ui/tokens/theme'

function PlainLargeInput({ value, onChangeText, placeholder, autoFocus }) {
    const { colors } = useTheme()
    const fontFamily = useHeadingFamily()

    const textStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.headlineSmall
    }), [colors.onBackground, fontFamily])
    const selectionColors = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.onBackground + TINT.fill
    }), [colors.accentText, colors.onBackground])

    return (
        <PlainTextField
            value={value}
            autoFocus={autoFocus}
            placeholder={placeholder}
            textStyle={textStyle}
            cursorColor={colors.onBackground}
            selectionColors={selectionColors}
            placeholderColor={colors.onBackground + TINT.placeholder}
            onChangeText={onChangeText}
        />
    )
}

export function LargeInput({ plain = false, value, onChangeText, placeholder, autoFocus }) {
    if (plain) {
        return (
            <PlainLargeInput
                value={value}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onChangeText={onChangeText}
            />
        )
    }

    return (
        <FilledTextField
            multiline={false}
            value={value}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChangeText={onChangeText}
        />
    )
}
