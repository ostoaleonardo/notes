import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { useGroupPosition } from '@/hooks/use-group-position'
import { getGroupedRadius } from '@/utils/group-position'
import { SPACING, OPACITY } from '@/constants/theme'

export function Option({
    title,
    description,
    rightContent,
    children,
    onPress,
    background,
    uppercase = true
}) {
    const { colors } = useTheme()
    const groupPosition = useGroupPosition()

    return (
        <Pressable
            accessibilityRole='button'
            onPress={onPress}
            style={{
                ...styles.container,
                ...(children ? styles.stacked : styles.inline),
                backgroundColor: background ?? colors.surface,
                ...getGroupedRadius(groupPosition)
            }}
        >
            <View style={styles.left}>
                <Typography uppercase={uppercase}>
                    {title}
                </Typography>
                {description && (
                    <Typography
                        opacity={OPACITY.muted}
                        variant='bodySmall'
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
