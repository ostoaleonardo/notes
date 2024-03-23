import { StyleSheet } from 'react-native'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function Toast({ message }) {
    return (
        message && (
            <Animated.View
                entering={SlideInDown}
                exiting={SlideOutDown}
                style={styles.container}
            >
                <Typography textAlign='center'>
                    {message}
                </Typography>
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
        backgroundColor: COLORS.primary,
    },
})
