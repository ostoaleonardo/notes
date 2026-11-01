import { useContext } from 'react'

import { HeadingFamilyContext } from '@/ui/context/heading-family-context'

export function useHeadingFamily() {
    return useContext(HeadingFamilyContext)
}
