import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

export function SplitButtonTrigger({ menuVisible, onPress, openProgress }) {
    const { colors } = useTheme()

    const animatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(openProgress.value, [0, 1], [4, 24]),
        borderBottomLeftRadius: interpolate(openProgress.value, [0, 1], [4, 24]),
        borderTopRightRadius: interpolate(openProgress.value, [0, 1], [22, 24]),
        borderBottomRightRadius: interpolate(openProgress.value, [0, 1], [22, 24]),
        opacity: interpolate(openProgress.value, [0, 1], [1, 0.8])
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
        width: 44,
        height: 44,
        overflow: 'hidden'
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
