import { extractLocalUrls, replaceLocalImageUrls } from '../local-images'

const ONE = 'file:///one.png'
const TWO = 'content://two.png'
const RESOLVED = 'data:one'

describe('extract local urls', () => {
    test('collects markdown image urls', () => {
        const result = extractLocalUrls(`![a](${ONE}) text ![b](${TWO})`)

        expect(result).toEqual([ONE, TWO])
    })

    test('collects html image urls', () => {
        expect(extractLocalUrls(`<img src="${ONE}" />`)).toEqual([ONE])
    })

    test('removes duplicates', () => {
        expect(extractLocalUrls(`![a](${ONE}) ![b](${ONE})`)).toEqual([ONE])
    })

    test('ignores remote urls', () => {
        expect(extractLocalUrls('![a](https://x.com/a.png)')).toEqual([])
    })
})

describe('replace local image urls', () => {
    const resolved = new Map([[ONE, RESOLVED]])

    test('replaces a markdown image url', () => {
        expect(replaceLocalImageUrls(`![a](${ONE})`, resolved)).toBe(`![a](${RESOLVED})`)
    })

    test('replaces an html image url', () => {
        const result = replaceLocalImageUrls(`<img src="${ONE}" />`, resolved)

        expect(result).toBe(`<img src="${RESOLVED}" />`)
    })

    test('keeps urls that have no resolution', () => {
        expect(replaceLocalImageUrls(`![a](${ONE})`, new Map())).toBe(`![a](${ONE})`)
    })
})
