import { StyleSheet, View } from 'react-native'
import { Circle, Svg } from 'react-native-svg'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'

export function CircularProgressIndicator({ size, stroke, progress, children }) {
    const { colors } = useTheme()

    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.ring}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill='none'
                    strokeWidth={stroke}
                    stroke={colors.onBackground + TRANSPARENT[10]}
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill='none'
                    strokeWidth={stroke}
                    strokeLinecap='round'
                    stroke={colors.accentText}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                />
            </Svg>
            <View style={[StyleSheet.absoluteFill, styles.content]}>{children}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    ring: {
        transform: [{ rotate: '-90deg' }]
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
