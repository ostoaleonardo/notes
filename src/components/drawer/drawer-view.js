import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native'

import { DrawerList } from './drawer-list'
import { DrawerToolbar, DrawerToolbarButton } from './drawer-toolbar'

export function DrawerView({
    data,
    renderItem,
    toolbarItems,
    toolbarExtra,
    ListEmptyComponent,
    listKey,
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
                    data={data}
                    renderItem={renderItem}
                    ListEmptyComponent={ListEmptyComponent}
                />
            </Animated.View>

            <DrawerToolbar>
                {toolbarItems.map(({ key, ...item }) => (
                    <DrawerToolbarButton
                        key={key}
                        {...item}
                    />
                ))}
                {toolbarExtra}
            </DrawerToolbar>

            {children}
        </>
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    }
})
