import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { useTheme } from 'react-native-paper'

import { getRippleColor } from '@/ui/utils/ripple'

export function Touchable({ borderless = false, children, ...props }) {
    const { colors } = useTheme()
    const ripple = useMemo(() => ({
        color: getRippleColor(colors),
        borderless
    }), [colors, borderless])

    return (
        <Pressable android_ripple={ripple} {...props}>
            {children}
        </Pressable>
    )
}
