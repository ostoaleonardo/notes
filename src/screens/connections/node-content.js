import { StyleSheet, View } from 'react-native'

import { EntityIcon } from './entity-icon'
import { Typography } from '@/components/typography'

import { GRAPH_NODE } from '@/constants/connections'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'

export function NodeContent({ kind, entity, title, palette, lines = 1 }) {
    const isRoot = kind === CONNECTION_NODE_KINDS.ROOT

    return (
        <View style={[styles.content, isRoot && styles.rootContent]}>
            <EntityIcon
                entity={entity}
                title={title}
                width={isRoot ? GRAPH_NODE.rootIconSize : GRAPH_NODE.iconSize}
                height={isRoot ? GRAPH_NODE.rootIconSize : GRAPH_NODE.iconSize}
                color={palette.icon}
            />
            <Typography
                uppercase
                numberOfLines={isRoot ? 2 : lines}
                fontSize={GRAPH_NODE.textSize}
                color={palette.text}
                bold={isRoot}
                textAlign={isRoot ? 'center' : undefined}
                styleProps={styles.title}
            >
                {title}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        gap: GRAPH_NODE.gap,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: GRAPH_NODE.paddingHorizontal
    },
    rootContent: {
        flexDirection: 'column',
        paddingHorizontal: GRAPH_NODE.gap
    },
    title: {
        flexShrink: 1
    }
})
