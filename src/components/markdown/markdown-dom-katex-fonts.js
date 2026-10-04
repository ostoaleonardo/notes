import { KATEX_FONT_FACES } from '@/constants/markdown-katex'

export const katexFontFacesCss = (katexFonts) => {
    if (!Object.keys(katexFonts || {}).length) return ''

    return KATEX_FONT_FACES.map(({ family, style, weight, file }) => `
        @font-face {
            font-family: '${family}'; font-style: ${style}; font-weight: ${weight};
            src: url(${katexFonts[file]}) format('woff2');
        }
    `).join('\n')
}
