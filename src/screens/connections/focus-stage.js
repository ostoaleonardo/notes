import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { FocusEdges } from './focus-edges'
import { FocusNode } from './focus-node'
import { Typography } from '@/components/typography'

import { entityKey } from '@/utils/connection-model'
import { layoutFocusRing } from '@/utils/focus-navigation'

import { FOCUS } from '@/constants/connections'
import { OPACITY, SPACING } from '@/constants/theme'

export const FocusStage = memo(function FocusStage({
    focus,
    focusTitle,
    satellites,
    hasPager,
    getTitle,
    emptyLabel,
    onPressNode,
    onSwipe
}) {
    const [size, setSize] = useState(null)

    const onLayout = useCallback((event) => {
        const { width, height } = event.nativeEvent.layout

        setSize({ width, height })
    }, [])

    const layout = useMemo(() => size && layoutFocusRing({
        ...size,
        count: satellites.length,
        nodeWidth: FOCUS.satelliteWidth,
        nodeHeight: FOCUS.satelliteHeight,
        reserve: hasPager ? FOCUS.pagerReserve : FOCUS.idleReserve,
        margin: FOCUS.margin,
        maxAspect: FOCUS.maxAspect
    }), [size, satellites.length, hasPager])

    const swipe = useMemo(() => (
        Gesture.Pan()
            .runOnJS(true)
            .activeOffsetX([-FOCUS.swipeActive, FOCUS.swipeActive])
            .failOffsetY([-FOCUS.swipeActive, FOCUS.swipeActive])
            .onEnd((event) => {
                if (Math.abs(event.translationX) < FOCUS.swipeThreshold) return

                onSwipe(event.translationX < 0 ? 1 : -1)
            })
    ), [onSwipe])

    const focusKey = entityKey(focus)

    return (
        <GestureDetector gesture={swipe}>
            <View style={styles.stage} onLayout={onLayout}>
                {layout && (
                    <>
                        <Animated.View
                            key={`edges-${focusKey}`}
                            pointerEvents='none'
                            entering={FadeIn
                                .duration(FOCUS.animationDuration)
                                .delay(FOCUS.edgeDelay)}
                            exiting={FadeOut.duration(FOCUS.exitDuration)}
                            style={StyleSheet.absoluteFill}
                        >
                            <FocusEdges
                                width={size.width}
                                height={size.height}
                                center={layout.center}
                                positions={layout.positions}
                                relations={satellites.map((item) => !!item.relation)}
                            />
                        </Animated.View>

                        <FocusNode
                            key={focusKey}
                            center
                            entity={focus}
                            title={focusTitle}
                            position={layout.center}
                            onPress={onPressNode}
                        />

                        {satellites.map((item, index) => (
                            <FocusNode
                                key={entityKey(item.entity)}
                                entity={item.entity}
                                title={getTitle(item.entity)}
                                relation={item.relation}
                                position={layout.positions[index]}
                                onPress={onPressNode}
                            />
                        ))}

                        {satellites.length === 0 && (
                            <View
                                pointerEvents='none'
                                style={[
                                    styles.empty,
                                    { top: layout.center.y + FOCUS.centerSize / 2 + SPACING.xxl }
                                ]}
                            >
                                <Typography opacity={OPACITY.secondary}>{emptyLabel}</Typography>
                            </View>
                        )}
                    </>
                )}
            </View>
        </GestureDetector>
    )
})

const styles = StyleSheet.create({
    stage: {
        flex: 1
    },
    empty: {
        left: 0,
        right: 0,
        position: 'absolute',
        alignItems: 'center'
    }
})
