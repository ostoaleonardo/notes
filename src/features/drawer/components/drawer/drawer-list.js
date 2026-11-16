import { memo, useMemo } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DRAWER_LIST_WINDOW } from '@/shared/constants/drawer-views'
import { SPACING } from '@/shared/constants/theme'

const getRowId = (row) => row.id

export const DrawerList = memo((props) => {
    const insets = useSafeAreaInsets()

    const contentContainerStyle = useMemo(() => ({
        flexGrow: 1,
        paddingTop: SPACING.md + insets.top,
        paddingBottom: SPACING.md,
        paddingStart: SPACING.md + insets.left,
        paddingEnd: SPACING.md + insets.right
    }), [insets.top, insets.left, insets.right])

    return (
        <FlatList
            keyExtractor={getRowId}
            {...DRAWER_LIST_WINDOW}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={contentContainerStyle}
            {...props}
        />
    )
})

const styles = StyleSheet.create({
    list: {
        flex: 1
    }
})
