import {
    DEFAULT_HEADING_FONT,
    HEADING_FONT_FAMILIES
} from '@/constants/heading-fonts'

export const isHeadingFontKey = (key) => key in HEADING_FONT_FAMILIES

export const resolveHeadingFontKey = (key) => (
    isHeadingFontKey(key) ? key : DEFAULT_HEADING_FONT
)

export const getHeadingFontFamily = (key) => HEADING_FONT_FAMILIES[resolveHeadingFontKey(key)]
