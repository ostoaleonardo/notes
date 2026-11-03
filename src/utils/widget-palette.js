import { COLORS, TRANSPARENT } from '@/constants/themes'

const buildPalette = ({ background, onBackground, foreground }) => ({
    background,
    surface: foreground,
    text: onBackground,
    muted: onBackground + TRANSPARENT[70]
})

export const WIDGET_PALETTES = {
    light: buildPalette(COLORS.light),
    dark: buildPalette(COLORS.dark)
}
