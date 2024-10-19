import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { Typography } from '../Typography'
import { COLORS } from '@/constants'

export function SnackBar({ message, setMessage, timeout = 3000, backgroundColor }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage('')
        }, timeout)

        return () => clearTimeout(timer)
    }, [message, timeout])

    if (!message) return null

    return (
        <Animated.View
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={[
                styles.container,
                backgroundColor && { backgroundColor }
            ]}
        >
            <Typography
                uppercase
                variant='caption'
                textAlign='center'
                color={COLORS.base.white}
            >
                {message}
            </Typography>
        </Animated.View>
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
        backgroundColor: COLORS.base.accent
    }
})
