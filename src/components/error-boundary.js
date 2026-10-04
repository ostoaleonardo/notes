import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, useColorScheme } from 'react-native'

import { Typography } from './typography'
import { Pressable } from '@/components/button/pressable'
import { logError } from '@/utils/log-error'

import { COLORS } from '@/constants/themes'
import { FONTS } from '@/constants/fonts'
import { SPACING } from '@/constants/spacing'

export function ErrorBoundary({ error, retry }) {
    const { t } = useTranslation()
    const colors = COLORS[useColorScheme() === 'light' ? 'light' : 'dark']

    useEffect(() => {
        logError('unhandled render error', error)
    }, [error])

    return (
        <View style={{ ...styles.container, backgroundColor: colors.background }}>
            <View style={{ gap: SPACING.lg }}>
                <Typography
                    fontSize={32}
                    textAlign='center'
                    color={colors.onBackground}
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {t('error_boundary.title')}
                </Typography>
                <Typography
                    opacity={0.6}
                    textAlign='center'
                    color={colors.onBackground}
                >
                    {t('error_boundary.message')}
                </Typography>
            </View>

            <Pressable
                onPress={retry}
                buttonColor={colors.onBackground}
                textColor={colors.background}
            >
                {t('button.try_again')}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.xxxl,
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
