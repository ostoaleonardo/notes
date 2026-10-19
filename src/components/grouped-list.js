import { useCallback } from 'react'
import { FlatList } from 'react-native'

import { GroupPositionContext } from '@/context/group-position-context'
import { getGroupPosition } from '@/utils/group-position'

export function GroupedList({ component: List = FlatList, data, renderItem, ...props }) {
    const total = data.length

    const renderGroupedItem = useCallback((info) => (
        <GroupPositionContext.Provider value={getGroupPosition(info.index, total)}>
            {renderItem(info)}
        </GroupPositionContext.Provider>
    ), [renderItem, total])

    return (
        <List
            data={data}
            renderItem={renderGroupedItem}
            {...props}
        />
    )
}
