import { buildBorder } from '../css-values'

describe('css values', () => {
    test('builds a one pixel solid border', () => {
        expect(buildBorder('#fff')).toBe('1px solid #fff')
    })
})
