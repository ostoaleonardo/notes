import { dataUrlToBytes } from '../data-url'

describe('data url to bytes', () => {
    test('decodes the base64 payload', () => {
        const bytes = dataUrlToBytes('data:application/pdf;base64,JVBERg==')

        expect([...bytes]).toEqual([37, 80, 68, 70])
    })

    test('returns null when the url is not base64', () => {
        expect(dataUrlToBytes('data:text/plain,hello')).toBeNull()
    })
})
