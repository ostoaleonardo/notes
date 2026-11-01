import { TRANSPARENT } from '@/constants/themes'

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
    uncheckedColor: colors.onBackground + TRANSPARENT[20],
    checkmarkColor: colors.background
})

export const getTextFieldColors = (colors) => ({
    focusedContainerColor: colors.surfaceVariant,
    unfocusedContainerColor: colors.surfaceVariant,
    focusedTextColor: colors.onBackground,
    unfocusedTextColor: colors.onBackground,
    cursorColor: colors.accentText,
    focusedIndicatorColor: colors.accentText,
    unfocusedIndicatorColor: colors.onBackground + TRANSPARENT[50],
    focusedLabelColor: colors.accentText,
    unfocusedLabelColor: colors.onBackground + TRANSPARENT[60],
    focusedPlaceholderColor: colors.onBackground + TRANSPARENT[40],
    unfocusedPlaceholderColor: colors.onBackground + TRANSPARENT[40]
})
