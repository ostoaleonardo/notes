import { TRANSPARENT } from '@/constants/themes'

export const buildDerivedColors = (colors, dark) => ({
    ...colors,
    selection: colors.tertiary + TRANSPARENT[20],
    placeholder: colors.onBackground + TRANSPARENT[40],
    codeBackground: colors.onBackground + TRANSPARENT[10],
    codeBlockBackground: colors.onBackground + (dark ? TRANSPARENT[5] : TRANSPARENT[20]),
    thematicBreak: colors.tertiary + TRANSPARENT[30]
})
