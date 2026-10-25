import { StyleSheet, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'

import { GRAPH_NODE } from '@/constants/connections'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'
import { RADIUS } from '@/constants/theme'

const DASH = '4 3'

const buildFilePath = (width, height) => {
    const { fileCorner: corner } = GRAPH_NODE
    const radius = RADIUS.sm

    return `M0 ${radius}Q0 0 ${radius} 0H${width - corner}L${width} ${corner}V${height}H0Z`
}

const getRadius = (kind, width, height) => {
    switch (kind) {
        case CONNECTION_NODE_KINDS.ROOT:
            return { borderRadius: Math.min(width, height) / 2 }
        case CONNECTION_NODE_KINDS.FOLDER:
            return {
                borderTopLeftRadius: RADIUS.sm,
                borderTopRightRadius: RADIUS.lg,
                borderBottomLeftRadius: RADIUS.lg,
                borderBottomRightRadius: RADIUS.lg
            }
        default:
            return { borderRadius: Math.min(RADIUS.lg, height / 2) }
    }
}

export function EntityShape({
    kind,
    width,
    height,
    fill,
    stroke,
    dashed = false,
    radius,
    style,
    children
}) {
    const strokeWidth = dashed ? GRAPH_NODE.dashedWidth : GRAPH_NODE.borderWidth

    if (kind === CONNECTION_NODE_KINDS.FILE) {
        return (
            <View style={[{ width, height }, style]}>
                <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                    <Path
                        d={buildFilePath(width, height)}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashed ? DASH : undefined}
                    />
                </Svg>
                {children}
            </View>
        )
    }

    const { folderTab: tab } = GRAPH_NODE
    const tabStyle = {
        top: tab.offset,
        width: tab.width,
        height: tab.height,
        backgroundColor: fill,
        borderColor: stroke,
        borderTopLeftRadius: RADIUS.sm,
        borderTopRightRadius: RADIUS.sm
    }

    return (
        <View
            style={[
                {
                    width,
                    height,
                    backgroundColor: fill,
                    borderColor: stroke,
                    borderWidth: strokeWidth,
                    borderStyle: dashed ? 'dashed' : 'solid'
                },
                radius ?? getRadius(kind, width, height),
                style
            ]}
        >
            {kind === CONNECTION_NODE_KINDS.FOLDER && !dashed && (
                <View style={[styles.tab, tabStyle]} />
            )}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    tab: {
        left: -GRAPH_NODE.borderWidth,
        position: 'absolute',
        borderWidth: GRAPH_NODE.borderWidth,
        borderBottomWidth: 0
    }
})
