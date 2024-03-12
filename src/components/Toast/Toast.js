import { StyleSheet, Text } from 'react-native'
import { colors, fonts } from '@/constants'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

export function Toast({ message }) {
    return (
        message && (
            <Animated.View
                entering={SlideInDown}
                exiting={SlideOutDown}
                style={styles.container}
            >
                <Text style={styles.text}>{message}</Text>
            </Animated.View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    text: {
        color: colors.text,
        textAlign: 'center',
        fontFamily: fonts.mono,
    },
})
