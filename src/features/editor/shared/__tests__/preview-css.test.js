import { buildPreviewCss } from '../markdown-dom-preview-css'
import { COLORS } from '@/shared/constants/themes'

const typography = { fontSize: 16, fontFamily: 'Azeret Mono', headingFontFamily: 'Inter' }

const build = (dark) => buildPreviewCss({ colors: dark ? COLORS.dark : COLORS.light, dark, typography })

describe('preview css', () => {
    test.each([false, true])('leaves no unresolved placeholder (dark: %s)', (dark) => {
        expect(build(dark)).not.toMatch(/\{\w+\}/)
    })

    test('applies the typography', () => {
        const css = build(false)

        expect(css).toContain('font-family: Azeret Mono')
        expect(css).toContain('font-family: Inter')
        expect(css).toContain('font-size: 16px')
    })

    test('scales every heading level from the font size', () => {
        const css = build(false)

        expect(css).toContain('.markdown-preview h1 { font-size: 32px; }')
        expect(css).toContain('.markdown-preview h6 { font-size: 19.2px; }')
    })

    test('uses the theme text color', () => {
        expect(build(false)).toContain(`color: ${COLORS.light.onBackground}`)
        expect(build(true)).toContain(`color: ${COLORS.dark.onBackground}`)
    })

    test('emits one rule per callout type', () => {
        expect(build(false)).toContain('border-left-color: #448aff')
    })
})
