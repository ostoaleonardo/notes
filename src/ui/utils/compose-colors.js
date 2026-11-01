import { TINT, TRANSPARENT } from '@/ui/tokens/transparent'

export const getSwitchColors = (colors) => ({
    checkedTrackColor: colors.tertiary,
    checkedThumbColor: colors.surface,
    checkedBorderColor: TRANSPARENT.color,
    uncheckedTrackColor: colors.surfaceVariant,
    uncheckedThumbColor: colors.onSurfaceVariant,
    uncheckedBorderColor: colors.outline
})

export const getCheckboxColors = (colors) => ({
    checkedColor: colors.onBackground,
    uncheckedColor: colors.onBackground + TINT.fill,
    checkmarkColor: colors.background
})

export const getButtonColors = (colors, variant) => {
    const disabledContainer = colors.onBackground + TINT.fill
    const disabledContent = colors.onBackground + TINT.placeholder

    if (variant === 'tonal') {
        return {
            containerColor: colors.surfaceVariant,
            contentColor: colors.onBackground,
            disabledContainerColor: disabledContainer,
            disabledContentColor: disabledContent
        }
    }

    if (variant === 'filled') {
        return {
            containerColor: colors.onBackground,
            contentColor: colors.background,
            disabledContainerColor: disabledContainer,
            disabledContentColor: disabledContent
        }
    }

    return {
        containerColor: TRANSPARENT.color,
        contentColor: colors.onBackground,
        disabledContainerColor: TRANSPARENT.color,
        disabledContentColor: disabledContent
    }
}

export const getTextFieldColors = (colors, containerColor = colors.surfaceVariant) => ({
    focusedContainerColor: containerColor,
    unfocusedContainerColor: containerColor,
    focusedTextColor: colors.onBackground,
    unfocusedTextColor: colors.onBackground,
    cursorColor: colors.accentText,
    focusedIndicatorColor: colors.accentText,
    unfocusedIndicatorColor: colors.onBackground + TINT.indicator,
    focusedLabelColor: colors.accentText,
    unfocusedLabelColor: colors.onBackground + TINT.label,
    focusedPlaceholderColor: colors.onBackground + TINT.placeholder,
    unfocusedPlaceholderColor: colors.onBackground + TINT.placeholder
})
