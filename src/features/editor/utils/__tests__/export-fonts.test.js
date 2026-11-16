import { pickExportFonts } from '../export-fonts'
import { HEADING_FONT_KEYS } from '@/constants/heading-fonts'

const fonts = {
    body: 'b',
    bodyBold: 'bb',
    bodyItalic: 'bi',
    heading: 'ntype',
    headingGeist: 'geist'
}

describe('fonts embedded in an export', () => {
    test('keeps the body faces and only the selected heading font', () => {
        expect(pickExportFonts(fonts, HEADING_FONT_KEYS.GEIST)).toEqual({
            body: 'b',
            bodyBold: 'bb',
            bodyItalic: 'bi',
            headingGeist: 'geist'
        })
    })

    test('selects NType when it is the heading font', () => {
        expect(pickExportFonts(fonts, HEADING_FONT_KEYS.NTYPE82).heading).toBe('ntype')
    })

    test('is undefined until the fonts have loaded', () => {
        expect(pickExportFonts(null, HEADING_FONT_KEYS.GEIST)).toBeUndefined()
    })
})
