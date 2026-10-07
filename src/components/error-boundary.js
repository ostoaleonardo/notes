import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'react-native'

import { MessageScreen } from './message-screen'
import { Pressable } from '@/components/button/pressable'
import { logError } from '@/utils/log-error'

import { COLORS } from '@/constants/themes'
import { THEME_MODES } from '@/constants/theme-options'
import { LOG_MESSAGES } from '@/constants/log-messages'

export function ErrorBoundary({ error, retry }) {
    const { t } = useTranslation()
    const colors = COLORS[useColorScheme() === THEME_MODES.LIGHT ? THEME_MODES.LIGHT : THEME_MODES.DARK]

    useEffect(() => {
        logError(LOG_MESSAGES.UNHANDLED_RENDER_ERROR, error)
    }, [error])

    return (
        <MessageScreen
            title={t('error_boundary.title')}
            message={t('error_boundary.message')}
            color={colors.onBackground}
            style={{ backgroundColor: colors.background }}
        >
            <Pressable
                onPress={retry}
                buttonColor={colors.onBackground}
                textColor={colors.background}
            >
                {t('button.try_again')}
            </Pressable>
        </MessageScreen>
    )
}
