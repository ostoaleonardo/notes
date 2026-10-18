import { StyleSheet, View } from 'react-native'

import { EntityIcon } from './entity-icon'
import { Typography } from '@/components/typography'

import { NODE_STYLE } from '@/constants/components'
import { CONNECTION_NODE_KINDS } from '@/constants/connections'

export function NodeContent({ kind, entity, title, palette, lines = 1 }) {
    const isRoot = kind === CONNECTION_NODE_KINDS.ROOT

    return (
        <View style={[styles.content, isRoot && styles.rootContent]}>
            <EntityIcon
                entity={entity}
                title={title}
                width={isRoot ? NODE_STYLE.rootIconSize : NODE_STYLE.iconSize}
                height={isRoot ? NODE_STYLE.rootIconSize : NODE_STYLE.iconSize}
                color={palette.icon}
            />
            <Typography
                uppercase
                numberOfLines={isRoot ? 2 : lines}
                fontSize={NODE_STYLE.textSize}
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
        gap: NODE_STYLE.gap,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: NODE_STYLE.paddingHorizontal
    },
    rootContent: {
        flexDirection: 'column',
        paddingHorizontal: NODE_STYLE.gap
    },
    title: {
        flexShrink: 1
    }
})
