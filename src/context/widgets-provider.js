import { useContext, useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { useTranslation } from 'react-i18next'

import bridgeWidget from '../../widgets/bridge'

import { WidgetsContext } from './widgets-context'
import { ThemeContext } from './theme-context'

import { useHeadingFont } from '@/hooks/use-heading-font'
import { useNotes } from '@/hooks/use-notes'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useUtils } from '@/hooks/use-utils'
import { buildPinnedNote } from '@/utils/widget-data'
import { buildWidgetProps } from '@/utils/widget-props'

import { STORAGE_BOOLEAN } from '@/constants/storage-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIDGET_GLASS_ALPHA, WIDGET_UPDATE_DELAY_MS } from '@/constants/widgets'

const IS_ANDROID = Platform.OS === 'android'

export const WidgetsProvider = ({ children }) => {
    const { t } = useTranslation()
    const { mode } = useContext(ThemeContext)

    const { pinned } = useUtils()
    const { notes, loading } = useNotes()
    const { fontKey } = useHeadingFont()

    const [glass, setGlass] = useState(false)
    const [alpha, setAlpha] = useState(WIDGET_GLASS_ALPHA.default)

    useStorageEffect(STORAGE_KEYS.WIDGET_GLASS, (value) => {
        setGlass(value === STORAGE_BOOLEAN.TRUE)
    })

    useStorageEffect(STORAGE_KEYS.WIDGET_GLASS_ALPHA, (value) => {
        const stored = Number(value)

        if (value && Number.isFinite(stored)) {
            setAlpha(Math.min(WIDGET_GLASS_ALPHA.max, Math.max(WIDGET_GLASS_ALPHA.min, stored)))
        }
    })

    useEffect(() => {
        if (!IS_ANDROID || loading) return undefined

        const timer = setTimeout(() => {
            bridgeWidget.updateSnapshot(buildWidgetProps({
                mode,
                headingFont: fontKey,
                glass,
                alpha,
                note: buildPinnedNote(notes, pinned),
                labels: {
                    newNote: t('settings.notes.startup.new'),
                    dailyNote: t('drawer.daily_note'),
                    pinned: t('search.pinned'),
                    empty: t('message.notes.no_recent')
                }
            }))
        }, WIDGET_UPDATE_DELAY_MS)

        return () => clearTimeout(timer)
    }, [notes, pinned, loading, mode, fontKey, glass, alpha, t])

    const value = useMemo(() => ({ glass, setGlass, alpha, setAlpha }), [glass, alpha])

    return (
        <WidgetsContext.Provider value={value}>
            {children}
        </WidgetsContext.Provider>
    )
}
