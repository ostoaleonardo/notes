import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useIndexingStatus } from '@/hooks/use-indexing-status'
import { setIndexingStatus } from '@/utils/indexing-status'

import { INDEXING_COMPLETE_NOTICE_MS } from '@/constants/indexing'
import { RADIUS, SPACING } from '@/ui/tokens/theme'

export const IndexingNotice = () => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()
    const status = useIndexingStatus()

    const complete = !!status?.complete

    useEffect(() => {
        if (!complete) return

        const timeout = setTimeout(() => setIndexingStatus(null), INDEXING_COMPLETE_NOTICE_MS)
        return () => clearTimeout(timeout)
    }, [complete])

    if (!status) return null

    return (
        <View
            pointerEvents='none'
            style={[
                styles.container, {
                    top: top + SPACING.sm,
                    backgroundColor: colors.surface,
                    borderColor: colors.outline
                }
            ]}
        >
            <Typography
                bold={true}
            >
                {t(complete ? 'indexing.complete' : 'indexing.title')}
            </Typography>

            {!complete && (
                <>
                    <Typography
                        variant='bodySmall'
                    >
                        {t('indexing.message')}
                    </Typography>

                    <View
                        style={[
                            styles.track, {
                                backgroundColor: colors.outline
                            }
                        ]}
                    >
                        <View
                            style={[
                                styles.bar,
                                {
                                    width: `${status.progress * 100}%`,
                                    backgroundColor: colors.onBackground
                                }
                            ]}
                        />
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: StyleSheet.hairlineWidth
    },
    track: {
        height: SPACING.xxs,
        marginTop: SPACING.xxs,
        borderRadius: RADIUS.full,
        overflow: 'hidden'
    },
    bar: {
        height: '100%',
        borderRadius: RADIUS.full
    }
})
