import { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { MenuItem } from './menu-item'

import { Check } from '@/icons/check'

import { TRANSPARENT } from '@/constants/themes'
import { SPACING } from '@/constants/spacing'

export function SelectMenuItem({ selected, style, contentStyle, ...props }) {
    const { colors } = useTheme()

    const renderCheck = useCallback(
        (iconProps) => <Check {...iconProps} color={colors.tertiary} />,
        [colors.tertiary]
    )

    return (
        <MenuItem
            contentStyle={[styles.item, contentStyle]}
            trailingIcon={selected ? renderCheck : undefined}
            style={selected ? [style, { backgroundColor: colors.tertiary + TRANSPARENT[10] }] : style}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        flexGrow: 1,
        flexShrink: 1,
        marginRight: SPACING.md
    }
})
