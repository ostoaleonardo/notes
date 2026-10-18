import { StyleSheet } from 'react-native'

import { DRAWER_ITEM } from '@/constants/components'

export const levelRowStyles = StyleSheet.create({
    touch: {
        flex: 1,
        minHeight: DRAWER_ITEM.minHeight,
        justifyContent: 'center',
        paddingStart: DRAWER_ITEM.paddingHorizontal
    },
    touchEnd: {
        paddingEnd: DRAWER_ITEM.paddingHorizontal
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
        gap: DRAWER_ITEM.gap,
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        flex: 1
    }
})
