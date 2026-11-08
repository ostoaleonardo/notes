import { StyleSheet, View } from 'react-native'

import { GridItem } from './grid-item'
import { getGridFillers } from './grid-rows'

import { GroupPositionContext } from '@/ui/context/group-position-context'

import { SPACING } from '@/ui/tokens/theme'

export const GroupedGridRow = ({ row, position, columns }) => (
    <GroupPositionContext.Provider value={position}>
        <View style={styles.row}>
            {row.map((item) => (
                <View
                    key={item.id}
                    style={styles.cell}
                >
                    <GridItem
                        title={item.title}
                        icon={item.icon}
                        active={item.active}
                        testID={item.testID}
                        onPress={item.onPress}
                    />
                </View>
            ))}

            {getGridFillers(row, columns).map((filler) => (
                <View
                    key={filler}
                    style={styles.cell}
                />
            ))}
        </View>
    </GroupPositionContext.Provider>
)

const styles = StyleSheet.create({
    row: {
        gap: SPACING.xxxs,
        flexDirection: 'row'
    },
    cell: {
        flex: 1
    }
})
