import { readFileText } from '../read-file-text'

const buildFile = (content) => ({
    bytes: async () => new TextEncoder().encode(content)
})

describe('read file text', () => {
    test('decodes the bytes of a file as text', async () => {
        expect(await readFileText(buildFile('{"version":1}'))).toBe('{"version":1}')
    })

    test('keeps characters outside ascii intact', async () => {
        const content = 'notas — ñandú 日本語 😀'

        expect(await readFileText(buildFile(content))).toBe(content)
    })

    test('returns an empty string for an empty file', async () => {
        expect(await readFileText(buildFile(''))).toBe('')
    })
})
