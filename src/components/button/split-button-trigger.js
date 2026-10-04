import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import {
    BUTTON_SIZE,
    SPLIT_TRIGGER_OPEN_OPACITY,
    SPLIT_TRIGGER_RADII
} from '@/constants/button'

export function SplitButtonTrigger({ menuVisible, onPress, openProgress }) {
    const { colors } = useTheme()

    const animatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(openProgress.value, [0, 1], [SPLIT_TRIGGER_RADII.left, SPLIT_TRIGGER_RADII.open]),
        borderBottomLeftRadius: interpolate(openProgress.value, [0, 1], [SPLIT_TRIGGER_RADII.left, SPLIT_TRIGGER_RADII.open]),
        borderTopRightRadius: interpolate(openProgress.value, [0, 1], [SPLIT_TRIGGER_RADII.right, SPLIT_TRIGGER_RADII.open]),
        borderBottomRightRadius: interpolate(openProgress.value, [0, 1], [SPLIT_TRIGGER_RADII.right, SPLIT_TRIGGER_RADII.open]),
        opacity: interpolate(openProgress.value, [0, 1], [1, SPLIT_TRIGGER_OPEN_OPACITY])
    }))

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
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        overflow: 'hidden'
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
