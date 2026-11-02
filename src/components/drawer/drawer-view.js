import Animated from 'react-native-reanimated'
import { StyleSheet, View } from 'react-native'

import { DrawerList } from './drawer-list'
import { DrawerLoading } from './drawer-loading'
import { DrawerToolbar, DrawerToolbarButton } from './drawer-toolbar'

import { SPACING } from '@/constants/theme'

export function DrawerView({
    data,
    renderItem,
    toolbarItems,
    toolbarExtra,
    ListEmptyComponent,
    loading = false,
    listKey,
    listRef,
    listEntering,
    children
}) {
    return (
        <>
            <Animated.View
                key={listKey}
                entering={listEntering}
                style={styles.list}
            >
                <DrawerList
                    ref={listRef}
                    data={data}
                    renderItem={renderItem}
                    ListEmptyComponent={loading ? DrawerLoading : ListEmptyComponent}
                />
            </Animated.View>

            <View style={styles.toolbar}>
                <DrawerToolbar>
                    {toolbarItems.map(({ key, ...item }) => (
                        <DrawerToolbarButton
                            key={key}
                            {...item}
                        />
                    ))}
                    {toolbarExtra}
                </DrawerToolbar>
            </View>

            {children}
        </>
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    },
    toolbar: {
        paddingTop: SPACING.xs
    }
})
