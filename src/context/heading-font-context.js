import { createContext } from 'react'

import { getHeadingFontFamily } from '@/utils/heading-font'

import { DEFAULT_HEADING_FONT } from '@/constants/heading-fonts'

export const HeadingFontContext = createContext({
    fontKey: DEFAULT_HEADING_FONT,
    fontFamily: getHeadingFontFamily(DEFAULT_HEADING_FONT),
    setFontKey: () => {}
})
