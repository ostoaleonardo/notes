import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { getGroupedRadius } from '@/utils/grouped-card-style'
import { SPACING, OPACITY } from '@/constants/theme'

export function Option({
    title,
    description,
    rightContent,
    children,
    onPress,
    isFirst,
    isLast
}) {
    const { colors } = useTheme()

    return (
        <Pressable
            accessibilityRole='button'
            onPress={onPress}
            style={{
                ...styles.container,
                ...(children ? styles.stacked : styles.inline),
                backgroundColor: colors.surface,
                ...getGroupedRadius(isFirst, isLast)
            }}
        >
            <View style={styles.left}>
                <Typography
                    uppercase
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        opacity={OPACITY.muted}
                        variant='caption'
                    >
                        {description}
                    </Typography>
                )}
            </View>
            {rightContent}
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.lg,
        padding: SPACING.lg
    },
    inline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    stacked: {
        alignItems: 'flex-start'
    },
    left: {
        flex: 1,
        gap: SPACING.xxs
    }
})
