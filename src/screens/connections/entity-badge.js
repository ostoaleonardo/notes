import { StyleSheet } from 'react-native'

import { EntityIcon } from './entity-icon'
import { EntityShape } from './entity-shape'

import { CONNECTION_NODE_KINDS, CONNECTION_TYPES } from '@/constants/connections'
import { TRANSPARENT } from '@/constants/themes'

const SHAPE_BY_TYPE = {
    [CONNECTION_TYPES.ROOT]: CONNECTION_NODE_KINDS.ROOT,
    [CONNECTION_TYPES.FOLDER]: CONNECTION_NODE_KINDS.FOLDER,
    [CONNECTION_TYPES.FILE]: CONNECTION_NODE_KINDS.FILE
}

export const getShapeKind = (entity) => SHAPE_BY_TYPE[entity.type] ?? CONNECTION_NODE_KINDS.NOTE

export function EntityBadge({ entity, title, size, iconSize, fill, color, selected = false }) {
    const isTag = entity.type === CONNECTION_TYPES.TAG
    const isRoot = entity.type === CONNECTION_TYPES.ROOT
    const background = isRoot || selected ? fill : fill + TRANSPARENT[20]

    return (
        <EntityShape
            kind={getShapeKind(entity)}
            width={size}
            height={size}
            fill={background}
            stroke='transparent'
            radius={isTag ? { borderRadius: size / 2 } : undefined}
            style={styles.badge}
        >
            <EntityIcon
                entity={entity}
                title={title}
                width={iconSize}
                height={iconSize}
                color={color}
            />
        </EntityShape>
    )
}

const styles = StyleSheet.create({
    badge: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
