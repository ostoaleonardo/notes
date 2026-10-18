import { useContext } from 'react'

import { HeadingFontContext } from '@/context/heading-font-context'

export function useHeadingFont() {
    return useContext(HeadingFontContext)
}
