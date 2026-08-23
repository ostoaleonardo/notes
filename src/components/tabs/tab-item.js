import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Typography } from '../typography'
import { useIconProps } from '@/hooks'
import { Close } from '@/icons'

export function TabItem({
    title,
    icon,
    active,
    pinned,
    accessibilityLabel,
    onLayout,
    onPress,
    onClose
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const iconProps = useIconProps(14, 0.6)

    return (
        <Pressable
            onPress={onPress}
            onLayout={onLayout}
            accessibilityLabel={accessibilityLabel}
            style={{
                ...styles.container,
                backgroundColor: active ? colors.surface : 'transparent'
            }}
        >
            {icon}

            {title && (
                <Typography
                    bold={active}
                    numberOfLines={1}
                    styleProps={styles.title}
                >
                    {title}
                </Typography>
            )}

            {!pinned && (
                <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    accessibilityLabel={t('button.close')}
                >
                    <Close {...iconProps} />
                </Pressable>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        maxWidth: 160
    },
    title: {
        flexShrink: 1
    }
})
