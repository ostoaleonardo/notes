import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DRAWER_LIST_WINDOW } from '@/constants/drawer-views'
import { SPACING } from '@/constants/theme'

const getRowId = (row) => row.id

export const DrawerList = (props) => {
    const insets = useSafeAreaInsets()

    return (
        <FlatList
            keyExtractor={getRowId}
            {...DRAWER_LIST_WINDOW}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={{
                flexGrow: 1,
                paddingTop: SPACING.md + insets.top,
                paddingBottom: SPACING.md,
                paddingStart: SPACING.md + insets.left,
                paddingEnd: SPACING.md + insets.right
            }}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    }
})
