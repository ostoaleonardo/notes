import { useCallback, useLayoutEffect, useState } from 'react'
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { getTargetWidth } from '@/utils/expanding-width'

import { CONTROL_SIZE, ICON_TOGGLE } from '@/constants/components'

const UNSET = -1

const EXPAND_TIMING = {
    duration: ICON_TOGGLE.expandDuration,
    easing: Easing.out(Easing.cubic)
}

export function useExpandingWidth(expanded, enabled, label) {
    const [measured, setMeasured] = useState({ label: null, width: null })
    const width = useSharedValue(enabled && !expanded ? CONTROL_SIZE.small : UNSET)

    const isMeasured = measured.label === label
    const contentWidth = isMeasured ? measured.width : null

    const onMeasure = useCallback((event) => {
        setMeasured({ label, width: event.nativeEvent.layout.width })
    }, [label])

    useLayoutEffect(() => {
        if (!enabled) return

        const target = getTargetWidth(expanded, contentWidth)
        if (target === null) return

        width.value = width.value === UNSET
            ? target
            : withTiming(target, EXPAND_TIMING)
    }, [enabled, expanded, contentWidth, width])

    const style = useAnimatedStyle(() => (
        width.value === UNSET ? {} : { width: width.value }
    ))

    return { style, contentWidth, needsMeasure: enabled && !isMeasured, onMeasure }
}
