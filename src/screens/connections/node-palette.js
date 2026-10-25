import { GRAPH_NODE } from '@/constants/connections'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'
import { TRANSPARENT } from '@/constants/themes'

export const getNodePalette = ({ kind, missing }, colors, selected = false) => {
    const subtle = colors.onBackground + TRANSPARENT[10]
    const accent = colors.tertiary
    const selectedFill = accent + TRANSPARENT[30]

    switch (kind) {
        case CONNECTION_NODE_KINDS.ROOT:
            return {
                fill: accent,
                stroke: accent,
                text: colors.onTertiary,
                icon: colors.onTertiary
            }
        case CONNECTION_NODE_KINDS.FOLDER:
            return {
                fill: selected ? selectedFill : colors.surfaceVariant,
                stroke: selected ? accent : colors.surfaceVariant,
                text: selected ? colors.accentText : colors.onBackground,
                icon: selected ? colors.accentText : colors.onBackground
            }
        case CONNECTION_NODE_KINDS.FILE:
            return {
                fill: selected ? selectedFill : colors.surfaceVariant,
                stroke: selected ? accent : subtle,
                text: colors.onBackground,
                icon: colors.onBackground
            }
        default:
            return {
                fill: missing ? colors.background : selected ? selectedFill : colors.surface,
                stroke: missing ? accent + TRANSPARENT[50] : selected ? accent : subtle,
                text: selected ? accent : colors.onBackground,
                icon: missing ? accent : colors.onBackground
            }
    }
}

export const getRootHalo = (colors) => [
    { spreadDistance: GRAPH_NODE.haloInner, color: colors.tertiary + TRANSPARENT[20] },
    { spreadDistance: GRAPH_NODE.haloOuter, color: colors.tertiary + TRANSPARENT[5] }
].map((layer) => ({ offsetX: 0, offsetY: 0, blurRadius: 0, ...layer }))
