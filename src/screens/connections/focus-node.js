import { memo, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated'

import { getShapeKind } from './entity-badge'
import { EntityShape } from './entity-shape'
import { NodeContent } from './node-content'
import { getNodePalette, getRootHalo } from './node-palette'
import { RelationBadge } from './relation-badge'

import {
    CONNECTION_NODE_KINDS,
    CONNECTION_TYPES,
    FOCUS
} from '@/constants/connections'
import { TEST_IDS } from '@/constants/test-ids'

const BADGE_ORIGIN = { x: 0, y: 0 }

export const FocusNode = memo(function FocusNode({
    entity,
    title,
    position,
    center = false,
    relation,
    onPress
}) {
    const { colors, dark } = useTheme()

    const kind = center ? CONNECTION_NODE_KINDS.ROOT : getShapeKind(entity)
    const size = center
        ? { width: FOCUS.centerSize, height: FOCUS.centerSize }
        : { width: FOCUS.satelliteWidth, height: FOCUS.satelliteHeight }
    const missing = entity.type === CONNECTION_TYPES.MISSING
    const palette = getNodePalette({ kind, missing: missing && !center }, colors, { dark })
    const haloStyle = useMemo(() => (
        center ? { boxShadow: getRootHalo(colors) } : null
    ), [center, colors])
    const handlePress = useCallback(() => onPress(entity, center), [onPress, entity, center])

    return (
        <Animated.View
            entering={ZoomIn.duration(FOCUS.animationDuration)}
            exiting={FadeOut.duration(FOCUS.exitDuration)}
            layout={LinearTransition.duration(FOCUS.animationDuration)}
            style={[
                styles.node,
                center && styles.center,
                {
                    left: position.x - size.width / 2,
                    top: position.y - size.height / 2,
                    width: size.width,
                    height: size.height
                }
            ]}
        >
            <Pressable
                testID={center ? TEST_IDS.CONNECTIONS_FOCUS_CENTER : undefined}
                accessibilityRole='button'
                accessibilityLabel={title}
                onPress={handlePress}
                style={StyleSheet.absoluteFill}
            >
                <EntityShape
                    kind={kind}
                    width={size.width}
                    height={size.height}
                    fill={palette.fill}
                    stroke={palette.stroke}
                    dashed={missing && !center}
                    style={haloStyle}
                >
                    <NodeContent
                        kind={kind}
                        entity={entity}
                        title={title}
                        palette={palette}
                        lines={FOCUS.satelliteLines}
                    />
                </EntityShape>
            </Pressable>

            {relation && <RelationBadge node={BADGE_ORIGIN} badge={relation} dimmed={false} />}
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    node: {
        position: 'absolute'
    },
    center: {
        zIndex: 2
    }
})
