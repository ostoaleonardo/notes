import { StyleSheet } from 'react-native'

import { DRAWER_ITEM } from '@/constants/components'
import { SPACING } from '@/constants/theme'

export const levelRowStyles = StyleSheet.create({
    touch: {
        flex: 1,
        minHeight: DRAWER_ITEM.minHeight,
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
        width: DRAWER_ITEM.slotSize,
        height: DRAWER_ITEM.slotSize,
        margin: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        gap: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        flex: 1
    }
})
