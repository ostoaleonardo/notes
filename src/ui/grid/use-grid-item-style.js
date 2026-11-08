import { useMemo } from 'react'

import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { useTheme } from '@/ui/hooks/use-theme'
import { getCornerRadii } from '@/ui/utils/group-position'

import { GRID_ITEM } from '@/ui/tokens/components'
import { GROUP_AXES } from '@/ui/tokens/group-position'
import { TINT } from '@/ui/tokens/transparent'

export const useGridItemStyle = (active) => {
    const { colors } = useTheme()
    const position = useGroupPosition()
    const radii = getCornerRadii(position, GROUP_AXES.STACKED)

    const contentColor = active ? colors.background : colors.onBackground
    const background = active ? colors.onBackground : colors.surfaceVariant

    const container = useMemo(() => ({
        borderTopLeftRadius: active ? GRID_ITEM.selectedRadius : radii.topLeft,
        borderTopRightRadius: active ? GRID_ITEM.selectedRadius : radii.topRight,
        borderBottomLeftRadius: active ? GRID_ITEM.selectedRadius : radii.bottomLeft,
        borderBottomRightRadius: active ? GRID_ITEM.selectedRadius : radii.bottomRight
    }), [
        active,
        radii.topLeft,
        radii.topRight,
        radii.bottomLeft,
        radii.bottomRight
    ])

    const fill = useMemo(() => ({ backgroundColor: background }), [background])

    const ripple = useMemo(() => ({ color: contentColor + TINT.ripple }), [contentColor])

    return { container, fill, ripple, contentColor }
}
