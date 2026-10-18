import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { SECTION_ICONS } from './entity-icon'

import { Link } from '@/icons/link'

import { BADGE_STYLE, NODE_STYLE } from '@/constants/components'
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
                    left: node.x - BADGE_STYLE.offset,
                    top: node.y - BADGE_STYLE.offset,
                    backgroundColor: colors.tertiary,
                    opacity: dimmed ? NODE_STYLE.dimOpacity : 1
                }
            ]}
        >
            <Icon
                width={BADGE_STYLE.iconSize}
                height={BADGE_STYLE.iconSize}
                color={colors.onTertiary}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        width: BADGE_STYLE.size,
        height: BADGE_STYLE.size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BADGE_STYLE.size / 2
    }
})
