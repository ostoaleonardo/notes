import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { useGroupPosition } from '@/hooks/use-group-position'
import { getGroupedRadius } from '@/utils/group-position'

import { TRANSPARENT } from '@/constants/themes'
import { SPACING, OPACITY } from '@/constants/theme'

export function ListItem({
    title,
    description,
    rightContent,
    children,
    onPress,
    background,
    uppercase = true
}) {
    const { colors } = useTheme()
    const position = useGroupPosition()

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: background ?? colors.surface },
                getGroupedRadius(position)
            ]}
        >
            <TouchableRipple
                accessibilityRole='button'
                onPress={onPress}
                rippleColor={colors.onBackground + TRANSPARENT[10]}
                style={[styles.container, children ? styles.stacked : styles.inline]}
            >
                <>
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
                </>
            </TouchableRipple>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden'
    },
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
