import { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { MenuItem } from './menu-item'

import { Check } from '@/ui/icons/check'

import { MENU } from '@/ui/tokens/components'
import { TINT } from '@/ui/tokens/transparent'

export function SelectMenuItem({ selected, style, contentStyle, ...props }) {
    const { colors } = useTheme()

    const renderCheck = useCallback(
        (iconProps) => <Check {...iconProps} color={colors.accentText} />,
        [colors.accentText]
    )

    return (
        <MenuItem
            contentStyle={[styles.item, contentStyle]}
            trailingIcon={selected ? renderCheck : undefined}
            style={selected ? [style, { backgroundColor: colors.tertiary + TINT.selected }] : style}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        flexGrow: 1,
        flexShrink: 1,
        marginRight: MENU.titleToTrailing
    }
})
