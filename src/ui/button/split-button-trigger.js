import { StyleSheet, View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/ui/icons/keyboard-arrow-up'
import { useTheme } from '@/ui/hooks/use-theme'

import { useSplitCorners } from '@/ui/hooks/use-split-corners'

import { BUTTON, SPLIT_TRIGGER_RADIUS } from '@/ui/tokens/components'
import { OPACITY, PROGRESS_RANGE } from '@/ui/tokens/theme'
import { Touchable } from '@/ui/touchable'

export const SplitButtonTrigger = ({
    menuVisible,
    label,
    onPress,
    openProgress,
    testID
}) => {
    const { colors } = useTheme()
    const { left, right } = useSplitCorners()

    const animatedStyle = useAnimatedStyle(() => {
        const radius = (closed) => interpolate(
            openProgress.value,
            PROGRESS_RANGE,
            [closed, SPLIT_TRIGGER_RADIUS.open]
        )

        return {
            borderTopLeftRadius: radius(left),
            borderBottomLeftRadius: radius(left),
            borderTopRightRadius: radius(right),
            borderBottomRightRadius: radius(right),
            opacity: interpolate(openProgress.value, PROGRESS_RANGE, [1, OPACITY.emphasized])
        }
    })

    return (
        <View style={styles.menu}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    animatedStyle,
                    { backgroundColor: colors.onBackground }
                ]}
            />
            <Touchable
                accessibilityRole='button'
                accessibilityLabel={label}
                accessibilityState={{ expanded: menuVisible }}
                onPress={onPress}
                testID={testID}
                style={styles.touchable}
            >
                {menuVisible
                    ? <KeyboardArrowUp color={colors.background} />
                    : <KeyboardArrowDown color={colors.background} />}
            </Touchable>
        </View>
    )
}

const styles = StyleSheet.create({
    menu: {
        width: BUTTON.size,
        height: BUTTON.size,
        overflow: 'hidden'
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
