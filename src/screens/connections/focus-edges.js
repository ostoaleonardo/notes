import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { Line, Svg } from 'react-native-svg'
import { useTheme } from 'react-native-paper'

import { EDGE_STYLE } from '@/constants/components'

export const FocusEdges = memo(function FocusEdges({
    width,
    height,
    center,
    positions,
    relations
}) {
    const { colors } = useTheme()

    return (
        <Svg width={width} height={height} pointerEvents='none' style={styles.edges}>
            {positions.map((position, index) => (
                <Line
                    key={index}
                    x1={center.x}
                    y1={center.y}
                    x2={position.x}
                    y2={position.y}
                    stroke={relations[index] ? colors.accentText : colors.onBackground}
                    strokeOpacity={relations[index] ? 1 : EDGE_STYLE.opacity}
                    strokeWidth={relations[index] ? EDGE_STYLE.hotWidth : EDGE_STYLE.width}
                    strokeDasharray={relations[index] ? EDGE_STYLE.relationDash : undefined}
                />
            ))}
        </Svg>
    )
})

const styles = StyleSheet.create({
    edges: {
        position: 'absolute'
    }
})
