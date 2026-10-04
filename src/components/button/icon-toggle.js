import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

import { BUTTON_DISABLED_OPACITY, BUTTON_SIZE, ICON_TOGGLE } from '@/constants/button'

export function IconToggle({
    icon: Icon,
    label,
    onPress,
    position = 'middle',
    showLabel = false,
    background,
    color,
    disabled = false
}) {
    const { colors } = useTheme()
    const backgroundColor = background ?? colors.surfaceVariant
    const contentColor = color ?? colors.onBackground

    const iconSize = showLabel ? ICON_TOGGLE.iconSizeWithLabel : ICON_TOGGLE.iconSize

    const [pressed, setPressed] = useState(false)
    const animatedStyle = useSegmentedCornerStyle(position, pressed)

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    { backgroundColor, opacity: disabled ? BUTTON_DISABLED_OPACITY : 1 }
                ]}
            >
                <TouchableRipple
                    accessibilityRole='button'
                    disabled={disabled}
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
                                width={iconSize}
                                height={iconSize}
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
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    touchableLabel: {
        height: BUTTON_SIZE,
        paddingHorizontal: ICON_TOGGLE.labelPaddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        gap: ICON_TOGGLE.gap,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
