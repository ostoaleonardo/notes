import { createContext } from 'react'

import { getHeadingFontFamily } from '@/shared/utils/heading-font'

import { DEFAULT_HEADING_FONT } from '@/shared/constants/heading-fonts'

export const HeadingFontContext = createContext({
    fontKey: DEFAULT_HEADING_FONT,
    fontFamily: getHeadingFontFamily(DEFAULT_HEADING_FONT),
    setFontKey: () => {}
})
