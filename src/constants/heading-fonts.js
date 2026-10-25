import { FONTS } from './theme'

export const HEADING_FONT_KEYS = {
    NTYPE82: 'ntype82',
    GEIST: 'geist'
}

export const HEADING_FONT_PREVIEW = 'Aa'
export const HEADING_FONT_TRANSLATION_KEY = 'settings.general.heading_font'

export const DEFAULT_HEADING_FONT = HEADING_FONT_KEYS.NTYPE82

export const HEADING_FONT_FAMILIES = {
    [HEADING_FONT_KEYS.NTYPE82]: FONTS.nType82Headline,
    [HEADING_FONT_KEYS.GEIST]: FONTS.geistMedium
}
