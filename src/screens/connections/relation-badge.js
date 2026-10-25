import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { SECTION_ICONS } from './entity-icon'

import { Link } from '@/icons/link'

import { GRAPH_BADGE, GRAPH_NODE } from '@/constants/connections'
import { CONNECTION_SECTIONS, RELATION_BADGES } from '@/constants/connections'

const BADGE_ICONS = {
    [RELATION_BADGES.OUT]: SECTION_ICONS[CONNECTION_SECTIONS.LINKS_OUT],
    [RELATION_BADGES.IN]: SECTION_ICONS[CONNECTION_SECTIONS.LINKS_IN],
    [RELATION_BADGES.FILES]: SECTION_ICONS[CONNECTION_SECTIONS.FILES],
    [RELATION_BADGES.BOTH]: Link
}

export const RelationBadge = memo(function RelationBadge({ node, badge, dimmed }) {
    const { colors } = useTheme()
    const Icon = BADGE_ICONS[badge]

    return (
        <View
            pointerEvents='none'
            style={[
                styles.badge,
                {
                    left: node.x - GRAPH_BADGE.offset,
                    top: node.y - GRAPH_BADGE.offset,
                    backgroundColor: colors.tertiary,
                    opacity: dimmed ? GRAPH_NODE.dimOpacity : 1
                }
            ]}
        >
            <Icon
                width={GRAPH_BADGE.iconSize}
                height={GRAPH_BADGE.iconSize}
                color={colors.onTertiary}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        width: GRAPH_BADGE.size,
        height: GRAPH_BADGE.size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: GRAPH_BADGE.size / 2
    }
})
