import { StyleSheet, View } from 'react-native'

import { Touchable } from '@/ui/touchable'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { TRANSPARENT } from '@/ui/tokens/transparent'
import { ICON_SIZE, OPACITY, RADIUS, SPACING } from '@/ui/tokens/theme'

export const PermissionCard = ({
    title,
    message,
    onPress,
    icon: Icon,
    dismissIcon: DismissIcon,
    dismissLabel,
    onDismiss
}) => {
    const { colors } = useTheme()

    return (
        <View
            style={[
                styles.card, {
                    backgroundColor: colors.tertiary + TRANSPARENT[10]
                }
            ]}
        >
            <Touchable
                accessibilityRole='button'
                onPress={onPress}
            >
                <View
                    style={[
                        styles.content,
                        onDismiss && styles.dismissible
                    ]}
                >
                    <View style={styles.text}>
                        <Typography
                            bold={true}
                            uppercase={true}
                            color={colors.accentText}
                            variant='bodySmall'
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant='bodySmall'
                            opacity={OPACITY.pressed}
                            styleProps={styles.message}
                        >
                            {message}
                        </Typography>
                    </View>
                    <Icon
                        width={ICON_SIZE.lg}
                        height={ICON_SIZE.lg}
                        color={colors.accentText}
                    />
                </View>
            </Touchable>

            {onDismiss && (
                <Touchable
                    borderless={true}
                    accessibilityRole='button'
                    accessibilityLabel={dismissLabel}
                    style={styles.dismiss}
                    onPress={onDismiss}
                >
                    <DismissIcon
                        width={ICON_SIZE.md}
                        height={ICON_SIZE.md}
                        color={colors.accentText}
                    />
                </Touchable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        borderRadius: RADIUS.lg
    },
    content: {
        gap: SPACING.md,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dismissible: {
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
