import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'

import { Typography } from '@/components/typography'

import { useGroupCornerStyle } from '@/hooks/use-group-corner-style'
import { usePressed } from '@/hooks/use-pressed'
import { GROUP_AXES } from '@/utils/group-position'

import { TRANSPARENT } from '@/constants/themes'
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
    const { pressed, onPressIn, onPressOut } = usePressed()
    const cornerStyle = useGroupCornerStyle(GROUP_AXES.CARD, pressed)

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: background ?? colors.surface },
                cornerStyle
            ]}
        >
            <TouchableRipple
                accessibilityRole='button'
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
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
        </Animated.View>
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
