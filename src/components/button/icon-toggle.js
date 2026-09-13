import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'
import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { useAnimatedProgress } from '@/hooks/use-animated-progress'

const GROUP_CORNERS = {
    first: { left: 24, right: 6 },
    middle: { left: 6, right: 6 },
    last: { left: 6, right: 24 }
}

export function IconToggle({
    icon: Icon,
    label,
    onPress,
    position = 'middle',
    showLabel = false,
    background,
    color
}) {
    const { colors } = useTheme()
    const { left, right } = GROUP_CORNERS[position]
    const backgroundColor = background ?? colors.surfaceVariant
    const contentColor = color ?? colors.onBackground

    const [pressed, setPressed] = useState(false)
    const progress = useAnimatedProgress(pressed)

    const animatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderTopRightRadius: interpolate(progress.value, [0, 1], [right, 24]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [right, 24])
    }))

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    { backgroundColor }
                ]}
            >
                <TouchableRipple
                    onPress={onPress}
                    onPressIn={() => setPressed(true)}
                    onPressOut={() => setPressed(false)}
                    style={showLabel ? styles.touchableLabel : styles.touchable}
                    accessibilityLabel={label}
                >
                    <View style={styles.content}>
                        {Icon && (
                            <Icon
                                color={contentColor}
                                width={showLabel ? 16 : 20}
                                height={showLabel ? 16 : 20}
                            />
                        )}
                        {showLabel && (
                            <Typography variant='caption' color={contentColor}>
                                {label}
                            </Typography>
                        )}
                    </View>
                </TouchableRipple>
            </AnimatedView>
        </Tooltip>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden'
    },
    touchable: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },
    touchableLabel: {
        height: 44,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        gap: 6,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
