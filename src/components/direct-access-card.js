import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Touchable } from '@/ui/touchable'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useDirectAccessPrompt } from '@/hooks/use-direct-access-prompt'

import { Close } from '@/icons/close'
import { FolderManaged } from '@/icons/folder-managed'

import { TRANSPARENT } from '@/constants/themes'
import { ICON_SIZE, OPACITY, RADIUS, SPACING } from '@/constants/theme'

export const DirectAccessCard = () => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { visible, onRequest, onDismiss } = useDirectAccessPrompt()

    if (!visible) return null

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.tertiary + TRANSPARENT[10] }
            ]}
        >
            <Touchable
                accessibilityRole='button'
                onPress={onRequest}
            >
                <View style={styles.content}>
                    <View style={styles.text}>
                        <Typography
                            bold
                            uppercase
                            color={colors.accentText}
                            variant='bodySmall'
                        >
                            {t('direct_access.title')}
                        </Typography>
                        <Typography
                            opacity={OPACITY.pressed}
                            variant='bodySmall'
                            styleProps={styles.message}
                        >
                            {t('direct_access.message')}
                        </Typography>
                    </View>
                    <FolderManaged
                        color={colors.accentText}
                        width={ICON_SIZE.lg}
                        height={ICON_SIZE.lg}
                    />
                </View>
            </Touchable>

            <Touchable
                borderless
                accessibilityRole='button'
                accessibilityLabel={t('button.close')}
                style={styles.dismiss}
                onPress={onDismiss}
            >
                <Close
                    color={colors.accentText}
                    width={ICON_SIZE.md}
                    height={ICON_SIZE.md}
                />
            </Touchable>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
        borderRadius: RADIUS.lg,
        overflow: 'hidden'
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.md,
        padding: SPACING.lg,
        paddingRight: SPACING.xxxxl
    },
    text: {
        flex: 1
    },
    message: {
        marginTop: SPACING.xxs
    },
    dismiss: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md
    }
})
