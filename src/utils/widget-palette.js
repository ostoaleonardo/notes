import { COLORS } from '@/constants/themes'
import { WIDGET_TEXT_COLORS } from '@/constants/widgets'

import { TRANSPARENT } from '@/ui/tokens/transparent'

const buildPalette = ({ background, foreground }, text) => ({
    background,
    surface: foreground,
    text,
    muted: text + TRANSPARENT[80]
})

export const WIDGET_PALETTES = {
    light: buildPalette(COLORS.light, WIDGET_TEXT_COLORS.light),
    dark: buildPalette(COLORS.dark, WIDGET_TEXT_COLORS.dark)
}
