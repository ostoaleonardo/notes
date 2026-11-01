import { memo } from 'react'
import { Pressable } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/ui/tokens/transparent'
import { ICON_SIZE, SPACING } from '@/ui/tokens/theme'

export const ListItemAction = memo(function ListItemAction({ label, onPress, children, ...props }) {
    const { colors } = useTheme()

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={label}
            hitSlop={SPACING.md}
            android_ripple={{
                color: colors.onBackground + TRANSPARENT[10],
                borderless: true,
                radius: ICON_SIZE.lg
            }}
            onPress={onPress}
            {...props}
        >
            {children}
        </Pressable>
    )
})
