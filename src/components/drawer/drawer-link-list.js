import { useCallback, useMemo } from 'react'

import { DrawerList } from './drawer-list'
import { DrawerLinkItem } from './drawer-link-item'
import { Typography } from '@/components/typography'

import { OPACITY } from '@/constants/theme'

export function DrawerLinkList({ rows, onPress, emptyMessage }) {
    const renderItem = useCallback(({ item }) => (
        <DrawerLinkItem
            row={item}
            onPress={onPress}
        />
    ), [onPress])

    const empty = useMemo(() => (
        <Typography opacity={OPACITY.secondary}>{emptyMessage}</Typography>
    ), [emptyMessage])

    return (
        <DrawerList
            data={rows}
            renderItem={renderItem}
            ListEmptyComponent={empty}
        />
    )
}
