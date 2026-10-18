import { StyleSheet, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'

import { NODE_STYLE } from '@/constants/components'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'

const DASH = '4 3'

const buildFilePath = (width, height) => {
    const { fileCorner: corner, fileRadius: radius } = NODE_STYLE

    return `M0 ${radius}Q0 0 ${radius} 0H${width - corner}L${width} ${corner}V${height}H0Z`
}

const getRadius = (kind, width, height) => {
    switch (kind) {
        case CONNECTION_NODE_KINDS.ROOT:
            return { borderRadius: Math.min(width, height) / 2 }
        case CONNECTION_NODE_KINDS.FOLDER:
            return {
                borderTopLeftRadius: NODE_STYLE.folderRadius.top,
                borderTopRightRadius: NODE_STYLE.folderRadius.rest,
                borderBottomLeftRadius: NODE_STYLE.folderRadius.rest,
                borderBottomRightRadius: NODE_STYLE.folderRadius.rest
            }
        default:
            return { borderRadius: Math.min(NODE_STYLE.noteRadius, height / 2) }
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
    const strokeWidth = dashed ? NODE_STYLE.dashedWidth : NODE_STYLE.borderWidth

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

    const { folderTab: tab } = NODE_STYLE
    const tabStyle = {
        top: tab.offset,
        width: tab.width,
        height: tab.height,
        backgroundColor: fill,
        borderColor: stroke,
        borderTopLeftRadius: tab.radius,
        borderTopRightRadius: tab.radius
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
        left: -NODE_STYLE.borderWidth,
        position: 'absolute',
        borderWidth: NODE_STYLE.borderWidth,
        borderBottomWidth: 0
    }
})
