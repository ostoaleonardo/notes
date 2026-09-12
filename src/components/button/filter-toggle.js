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

export function FilterToggle({ icon: Icon, label, selected, onPress, position = 'middle', disabled = false }) {
    const { colors } = useTheme()
    const { left, right } = GROUP_CORNERS[position]
    const progress = useAnimatedProgress(selected)

    const animatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderTopRightRadius: interpolate(progress.value, [0, 1], [right, 24]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [right, 24])
    }))

    const contentColor = selected ? colors.background : colors.onBackground

    return (
        <Tooltip title={label}>
            <AnimatedView
                style={[
                    styles.container,
                    animatedStyle,
                    disabled && styles.disabled, {
                        borderColor: colors.outline,
                        backgroundColor: selected ? colors.onBackground : 'transparent'
                    }
                ]}
            >
                <TouchableRipple
                    disabled={disabled}
                    onPress={onPress}
                    style={styles.touchable}
                    accessibilityLabel={label}
                >
                    <View style={styles.content}>
                        <Icon color={contentColor} width={16} height={16} />
                        <Typography variant='caption' color={contentColor}>
                            {label}
                        </Typography>
                    </View>
                </TouchableRipple>
            </AnimatedView>
        </Tooltip>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        overflow: 'hidden'
    },
    disabled: {
        opacity: 0.4
    },
    touchable: {
        paddingVertical: 6,
        paddingHorizontal: 12
    },
    content: {
        gap: 6,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
