import { FONTS } from '@/constants/fonts'

export const fontFacesCss = (fonts) => {
    if (!fonts) return ''

    return `
        @font-face { font-family: '${FONTS.azeretLight}'; src: url(${fonts.body}); font-weight: 400; font-style: normal; }
        @font-face { font-family: '${FONTS.azeretLight}'; src: url(${fonts.bodyBold}); font-weight: 700; font-style: normal; }
        @font-face { font-family: '${FONTS.azeretLight}'; src: url(${fonts.bodyItalic}); font-weight: 400; font-style: italic; }
        @font-face { font-family: '${FONTS.nType82Headline}'; src: url(${fonts.heading}); }
    `
}
