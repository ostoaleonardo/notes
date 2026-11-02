import { useContext, useMemo } from 'react'
import { DropdownMenuGroup } from '@expo/ui/jetpack-compose'
import {
    Shapes,
    background,
    clip,
    height,
    padding,
    verticalScroll
} from '@expo/ui/jetpack-compose/modifiers'

import { MenuGroupContext } from '@/ui/context/menu-group-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { BORDER_WIDTH, RADIUS, SPACING } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const INSET = SPACING.xxs - BORDER_WIDTH.thin
const spacing = padding(INSET, 0, INSET, 0)

const getCorners = ({ index, count }, inset) => {
    const outer = RADIUS.lg - inset
    const inner = RADIUS.md - inset
    const top = index === 0 ? outer : inner
    const bottom = index === count - 1 ? outer : inner

    return {
        topStart: top,
        topEnd: top,
        bottomStart: bottom,
        bottomEnd: bottom
    }
}

export function MenuGroup({ children }) {
    const { colors } = useTheme()
    const { maxHeight, index, count } = useContext(MenuGroupContext)

    const shapes = useMemo(() => ({ index, count }), [index, count])

    const modifiers = useMemo(() => {
        const content = maxHeight ? [height(maxHeight), verticalScroll(), spacing] : [spacing]

        return [
            clip(Shapes.RoundedCorner(getCorners(shapes, 0))),
            background(colors.onBackground + TINT.hairline),
            padding(BORDER_WIDTH.thin, BORDER_WIDTH.thin, BORDER_WIDTH.thin, BORDER_WIDTH.thin),
            clip(Shapes.RoundedCorner(getCorners(shapes, BORDER_WIDTH.thin))),
            background(colors.surface),
            ...content
        ]
    }, [maxHeight, shapes, colors.onBackground, colors.surface])

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
