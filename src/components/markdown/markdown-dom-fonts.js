import { FONT_FAMILY_NAMES } from '@/constants/markdown-fonts'

export const fontFacesCss = (fonts) => {
    if (!fonts) return ''

    return `
        @font-face { font-family: '${FONT_FAMILY_NAMES.body}'; src: url(${fonts.body}); font-weight: 400; font-style: normal; }
        @font-face { font-family: '${FONT_FAMILY_NAMES.body}'; src: url(${fonts.bodyBold}); font-weight: 700; font-style: normal; }
        @font-face { font-family: '${FONT_FAMILY_NAMES.body}'; src: url(${fonts.bodyItalic}); font-weight: 400; font-style: italic; }
        @font-face { font-family: '${FONT_FAMILY_NAMES.heading}'; src: url(${fonts.heading}); }
    `
}
