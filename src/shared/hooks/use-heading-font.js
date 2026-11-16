import { useContext } from 'react'

import { HeadingFontContext } from '@/shared/context/heading-font-context'

export function useHeadingFont() {
    return useContext(HeadingFontContext)
}
