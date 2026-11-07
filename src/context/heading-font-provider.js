import { useMemo, useState } from 'react'

import { HeadingFontContext } from './heading-font-context'
import { HeadingFamilyContext } from '@/ui/context/heading-family-context'

import { useStorageEffect } from '@/hooks/use-storage-effect'
import { getHeadingFontFamily, isHeadingFontKey } from '@/utils/heading-font'

import { DEFAULT_HEADING_FONT } from '@/constants/heading-fonts'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const HeadingFontProvider = ({ children }) => {
    const [fontKey, setFontKey] = useState(DEFAULT_HEADING_FONT)

    useStorageEffect(STORAGE_KEYS.HEADING_FONT, (value) => {
        if (isHeadingFontKey(value)) setFontKey(value)
    })

    const value = useMemo(() => ({
        fontKey,
        fontFamily: getHeadingFontFamily(fontKey),
        setFontKey
    }), [fontKey])

    return (
        <HeadingFontContext.Provider value={value}>
            <HeadingFamilyContext.Provider value={value.fontFamily}>
                {children}
            </HeadingFamilyContext.Provider>
        </HeadingFontContext.Provider>
    )
}
