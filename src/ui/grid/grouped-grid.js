import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { GroupedGridRow } from './grouped-grid-row'
import { toGridRows } from './grid-rows'

import { getGroupPosition } from '@/ui/utils/group-position'

import { SPACING } from '@/ui/tokens/theme'

export const GroupedGrid = ({ items, columns, style }) => {
    const rows = useMemo(() => toGridRows(items, columns), [items, columns])

    return (
        <View style={[styles.grid, style]}>
            {rows.map((row, index) => (
                <GroupedGridRow
                    key={row[0].id}
                    row={row}
                    columns={columns}
                    position={getGroupPosition(index, rows.length)}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    grid: {
        gap: SPACING.xxxs
    }
})
