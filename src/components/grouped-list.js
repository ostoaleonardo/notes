import { useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

import { GroupPositionContext } from '@/context/group-position-context'
import { getGroupPosition } from '@/utils/group-position'

import { SPACING } from '@/constants/theme'

export const GroupSeparator = () => <View style={styles.separator} />

export function GroupedList({ component: List = FlatList, data, renderItem, ...props }) {
    const total = data?.length ?? 0

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

const styles = StyleSheet.create({
    separator: {
        height: SPACING.xxxs
    }
})
