import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Tooltip, TouchableRipple, useTheme } from 'react-native-paper'

import { AnimatedView } from '../animated/animated-view'
import { Typography } from '../typography'

import { useSegmentedCornerStyle } from '@/hooks/use-segmented-corner-style'

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

    const [pressed, setPressed] = useState(false)
    const animatedStyle = useSegmentedCornerStyle(position, pressed)

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    { backgroundColor, opacity: disabled ? 0.4 : 1 }
                ]}
            >
                <TouchableRipple
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
