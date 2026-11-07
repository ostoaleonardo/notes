import { useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

import { GroupPositionContext } from '@/ui/context/group-position-context'
import { usePagedRows } from '@/ui/hooks/use-paged-rows'
import { getGroupPosition } from '@/ui/utils/group-position'

import { LIST_WINDOW } from '@/ui/tokens/components'
import { SPACING } from '@/ui/tokens/theme'

export const GroupSeparator = () => <View style={styles.separator} />

const NO_ROWS = []

export const GroupedList = ({
    component: List = FlatList,
    data,
    paged = false,
    total: totalOverride,
    renderItem,
    onEndReached,
    ...props
}) => {
    const rows = data ?? NO_ROWS
    const page = usePagedRows(rows, paged ? LIST_WINDOW.pageSize : Infinity)
    const total = totalOverride ?? rows.length

    const renderGroupedItem = useCallback((info) => (
        <GroupPositionContext.Provider value={getGroupPosition(info.index, total)}>
            {renderItem(info)}
        </GroupPositionContext.Provider>
    ), [renderItem, total])

    return (
        <List
            data={paged ? page.data : data}
            renderItem={renderGroupedItem}
            onEndReached={paged ? page.onEndReached : onEndReached}
            onEndReachedThreshold={LIST_WINDOW.endThreshold}
            initialNumToRender={LIST_WINDOW.initial}
            maxToRenderPerBatch={LIST_WINDOW.batch}
            windowSize={LIST_WINDOW.window}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    separator: {
        height: SPACING.xxxs
    }
})
