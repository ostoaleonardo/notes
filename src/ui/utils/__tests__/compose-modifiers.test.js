import { paddingHorizontal } from '../compose-modifiers'

describe('compose modifiers', () => {
    test('pads only the horizontal sides', () => {
        const result = JSON.stringify(paddingHorizontal(24))

        expect(result).toContain('"start":24')
        expect(result).toContain('"end":24')
        expect(result).toContain('"top":0')
        expect(result).toContain('"bottom":0')
    })
})
