import { StyleSheet } from 'react-native'

import { TREE_ROW } from '@/ui/tokens/components'
import { SPACING } from '@/ui/tokens/theme'

export const treeRowStyles = StyleSheet.create({
    touch: {
        flex: 1,
        minHeight: TREE_ROW.minHeight,
        justifyContent: 'center',
        paddingStart: SPACING.md
    },
    touchEnd: {
        paddingEnd: SPACING.md
    },
    touchStart: {
        paddingStart: 0
    },
    slot: {
        width: TREE_ROW.slotSize,
        height: TREE_ROW.slotSize,
        margin: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        flex: 1
    }
})
