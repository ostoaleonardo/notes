import { memo } from 'react'
import { Pressable } from 'react-native'
import { useTheme } from 'react-native-paper'

import { getRippleColor } from '@/ui/utils/ripple'

import { HIT_SLOP, RIPPLE } from '@/ui/tokens/components'

export const ListItemAction = memo(function ListItemAction({ label, onPress, children, ...props }) {
    const { colors } = useTheme()

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={label}
            hitSlop={HIT_SLOP.icon}
            android_ripple={{
                color: getRippleColor(colors),
                borderless: true,
                radius: RIPPLE.iconRadius
            }}
            onPress={onPress}
            {...props}
        >
            {children}
        </Pressable>
    )
})
