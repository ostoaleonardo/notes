import { HEADING_FONT_KEYS } from '@/constants/heading-fonts'

const HEADING_FONT_MODULE_KEYS = {
    [HEADING_FONT_KEYS.NTYPE82]: 'heading',
    [HEADING_FONT_KEYS.GEIST]: 'headingGeist'
}

export const pickExportFonts = (fonts, headingFontKey) => {
    if (!fonts?.body) return undefined

    const headingKey = HEADING_FONT_MODULE_KEYS[headingFontKey]

    return {
        body: fonts.body,
        bodyBold: fonts.bodyBold,
        bodyItalic: fonts.bodyItalic,
        [headingKey]: fonts[headingKey]
    }
}
