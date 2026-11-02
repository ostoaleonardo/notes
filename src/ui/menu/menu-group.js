import { useContext } from 'react'
import { useTheme } from 'react-native-paper'
import { DropdownMenuGroup } from '@expo/ui/jetpack-compose'
import { padding } from '@expo/ui/jetpack-compose/modifiers'

import { MenuGroupContext } from '@/ui/context/menu-group-context'

import { SPACING } from '@/ui/tokens/theme'

const modifiers = [
    padding(SPACING.xxs, SPACING.xxxs / 2, SPACING.xxs, SPACING.xxxs / 2)
]

export function MenuGroup({ children }) {
    const { colors } = useTheme()
    const shapes = useContext(MenuGroupContext)

    return (
        <DropdownMenuGroup
            shapes={shapes}
            containerColor={colors.surface}
            shadowElevation={0}
            modifiers={modifiers}
        >
            {children}
        </DropdownMenuGroup>
    )
}
