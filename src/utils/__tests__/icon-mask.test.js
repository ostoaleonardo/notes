import { buildIconMaskUrl } from '../icon-mask'
import { ICON_VIEW_BOX } from '@/constants/theme'

describe('icon mask', () => {
    const decode = (url) => decodeURIComponent(url.slice('url("data:image/svg+xml,'.length, -2))

    test('wraps the svg in a css url data uri', () => {
        const url = buildIconMaskUrl('M0 0h10')

        expect(url.startsWith('url("data:image/svg+xml,')).toBe(true)
        expect(url.endsWith('")')).toBe(true)
    })

    test('embeds the path and the shared view box', () => {
        const svg = decode(buildIconMaskUrl('M0 0h10'))

        expect(svg).toContain('<path d="M0 0h10"/>')
        expect(svg).toContain(`viewBox="${ICON_VIEW_BOX}"`)
    })

    test('encodes characters that would break the css url', () => {
        const url = buildIconMaskUrl('M0 0h10')

        expect(url).not.toMatch(/[<> ]/)
    })
})
