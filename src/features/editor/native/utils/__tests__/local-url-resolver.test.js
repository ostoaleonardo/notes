import { resolveLocalUrls } from '../local-url-resolver'

import { MAX_PREVIEW_IMAGE_CACHE } from '@/shared/constants/image'

const setup = () => ({
    resolveUrl: jest.fn(async (url) => `data:${url}`),
    cache: new Map()
})

describe('resolve local urls', () => {
    test('maps each url to its resolved data url', async () => {
        const deps = setup()

        const result = await resolveLocalUrls({ urls: ['file:///a.png', 'file:///b.png'], ...deps })

        expect(result).toEqual({
            'file:///a.png': 'data:file:///a.png',
            'file:///b.png': 'data:file:///b.png'
        })
    })

    test('reuses cached urls', async () => {
        const deps = setup()

        await resolveLocalUrls({ urls: ['file:///a.png'], ...deps })
        await resolveLocalUrls({ urls: ['file:///a.png'], ...deps })

        expect(deps.resolveUrl).toHaveBeenCalledTimes(1)
    })

    test('evicts the oldest entries beyond the cache limit', async () => {
        const deps = setup()
        const urls = Array.from({ length: MAX_PREVIEW_IMAGE_CACHE + 1 }, (_, index) => `file:///${index}.png`)

        await resolveLocalUrls({ urls, ...deps })
        deps.resolveUrl.mockClear()
        await resolveLocalUrls({ urls: [urls[0]], ...deps })

        expect(deps.resolveUrl).toHaveBeenCalledTimes(1)
    })
})
