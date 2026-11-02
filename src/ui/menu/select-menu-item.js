import { useTheme } from 'react-native-paper'

import { MenuItem } from './menu-item'

import { Check } from '@/ui/icons/check'

import { TINT } from '@/ui/tokens/transparent'

export function SelectMenuItem({ selected, ...props }) {
    const { colors } = useTheme()

    return (
        <MenuItem
            trailingIcon={selected ? Check : undefined}
            highlight={selected ? colors.tertiary + TINT.selected : undefined}
            {...props}
        />
    )
}
