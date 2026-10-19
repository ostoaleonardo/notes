import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import { useGroupPosition } from '@/hooks/use-group-position'
import { getSegmentCorners } from '@/utils/group-position'

import { BUTTON, SPLIT_TRIGGER_RADIUS } from '@/constants/components'
import { OPACITY, PROGRESS_RANGE } from '@/constants/theme'

export function SplitButtonTrigger({ menuVisible, onPress, openProgress, testID }) {
    const { colors } = useTheme()
    const position = useGroupPosition()
    const { left, right } = getSegmentCorners(
        position,
        SPLIT_TRIGGER_RADIUS.outer,
        SPLIT_TRIGGER_RADIUS.inner
    )

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
            <TouchableRipple
                accessibilityRole='button'
                onPress={onPress}
                testID={testID}
                style={styles.touchable}
            >
                {menuVisible
                    ? <KeyboardArrowUp color={colors.background} />
                    : <KeyboardArrowDown color={colors.background} />}
            </TouchableRipple>
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
