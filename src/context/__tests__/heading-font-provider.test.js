import { act, renderHook } from '@testing-library/react-native'

import { HeadingFontProvider } from '../heading-font-provider'
import { useHeadingFont } from '@/hooks/use-heading-font'
import { HEADING_FONT_KEYS } from '@/constants/heading-fonts'
import { FONTS } from '@/constants/theme'

const mockStored = { value: null }

jest.mock('@/hooks/use-storage-effect', () => ({
    useStorageEffect: (_key, onValue) => {
        const { useEffect } = require('react')

        useEffect(() => {
            onValue(mockStored.value)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    }
}))

const wrapper = ({ children }) => <HeadingFontProvider>{children}</HeadingFontProvider>

describe('heading font provider', () => {
    beforeEach(() => {
        mockStored.value = null
    })

    test('uses the default font when nothing is stored', async () => {
        const { result } = await renderHook(() => useHeadingFont(), { wrapper })

        expect(result.current.fontFamily).toBe(FONTS.nType82Headline)
    })

    test('uses the stored font', async () => {
        mockStored.value = HEADING_FONT_KEYS.GEIST

        const { result } = await renderHook(() => useHeadingFont(), { wrapper })

        expect(result.current.fontFamily).toBe(FONTS.geistMedium)
    })

    test('ignores an invalid stored font', async () => {
        mockStored.value = 'comic'

        const { result } = await renderHook(() => useHeadingFont(), { wrapper })

        expect(result.current.fontKey).toBe(HEADING_FONT_KEYS.NTYPE82)
    })

    test('updates the font family when another font is selected', async () => {
        const { result } = await renderHook(() => useHeadingFont(), { wrapper })

        await act(async () => result.current.setFontKey(HEADING_FONT_KEYS.GEIST))

        expect(result.current.fontFamily).toBe(FONTS.geistMedium)
    })
})
