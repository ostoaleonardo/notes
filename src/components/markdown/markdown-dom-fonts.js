export const FONT_FAMILY_NAMES = {
    body: 'AzeretMono-Light',
    heading: 'NType82-Headline'
}

export const fontFacesCss = (fonts) => {
    if (!fonts) return ''

    return `
        @font-face { font-family: '${FONT_FAMILY_NAMES.body}'; src: url(${fonts.body}); font-weight: 400; }
        @font-face { font-family: '${FONT_FAMILY_NAMES.body}'; src: url(${fonts.bodyBold}); font-weight: 700; }
        @font-face { font-family: '${FONT_FAMILY_NAMES.heading}'; src: url(${fonts.heading}); }
    `
}
