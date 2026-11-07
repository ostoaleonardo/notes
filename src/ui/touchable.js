import { useMemo } from 'react'
import { Pressable } from 'react-native'

import { getRippleColor } from '@/ui/utils/ripple'
import { useTheme } from '@/ui/hooks/use-theme'

export const Touchable = ({
    borderless = false,
    children,
    ...props
}) => {
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
