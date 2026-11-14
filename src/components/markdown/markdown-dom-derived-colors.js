import { TRANSPARENT } from '@/constants/themes'

export const buildDerivedColors = (colors) => ({
    ...colors,
    selection: colors.tertiary + TRANSPARENT[20],
    placeholder: colors.onBackground + TRANSPARENT[40],
    codeBackground: colors.onBackground + TRANSPARENT[10],
    codeBlockBackground: colors.onBackground + TRANSPARENT[5],
    thematicBreak: colors.tertiary + TRANSPARENT[30]
})
