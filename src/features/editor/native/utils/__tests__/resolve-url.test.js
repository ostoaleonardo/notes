import { resolveUrl } from '../resolve-url'

const mockBase64 = jest.fn()

jest.mock('expo-file-system', () => ({
    File: class {
        constructor(uri) {
            this.uri = uri
            this.type = uri.endsWith('.png') ? 'image/png' : ''
        }

        base64() {
            return mockBase64(this.uri)
        }
    }
}))

describe('resolve url', () => {
    beforeEach(() => {
        mockBase64.mockReset()
    })

    test('returns a data url using the file mime type', async () => {
        mockBase64.mockResolvedValue('TWFu')

        expect(await resolveUrl('file:///a.png')).toBe('data:image/png;base64,TWFu')
    })

    test('falls back to jpeg when the mime type is unknown', async () => {
        mockBase64.mockResolvedValue('TWFu')

        expect(await resolveUrl('file:///a.bin')).toBe('data:image/jpeg;base64,TWFu')
    })

    test('returns the original url when the file cannot be read', async () => {
        mockBase64.mockRejectedValue(new Error('gone'))

        expect(await resolveUrl('file:///a.png')).toBe('file:///a.png')
    })
})
