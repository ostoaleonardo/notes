import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'react-native'

import { MessageScreen } from '../ui/message-screen'
import { ThemeContext } from '@/ui/context/theme-context'
import { FilledButton } from '@/ui/button/filled-button'
import { logError } from '@/utils/log-error'

import { COLORS, THEMES } from '@/constants/themes'
import { THEME_MODES } from '@/constants/theme-options'
import { LOG_MESSAGES } from '@/constants/log-messages'

export const ErrorBoundary = ({ error, retry }) => {
    const { t } = useTranslation()
    const scheme = useColorScheme() === THEME_MODES.LIGHT ? THEME_MODES.LIGHT : THEME_MODES.DARK
    const colors = COLORS[scheme]

    useEffect(() => {
        logError(LOG_MESSAGES.UNHANDLED_RENDER_ERROR, error)
    }, [error])

    return (
        <ThemeContext.Provider value={THEMES[scheme]}>
            <MessageScreen
                title={t('error_boundary.title')}
                message={t('error_boundary.message')}
                color={colors.onBackground}
                style={{ backgroundColor: colors.background }}
            >
                <FilledButton onPress={retry}>
                    {t('button.try_again')}
                </FilledButton>
            </MessageScreen>
        </ThemeContext.Provider>
    )
}
