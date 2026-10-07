import { DrawerList } from './drawer-list'
import { DrawerToolbar, DrawerToolbarButton } from './drawer-toolbar'

export function DrawerView({
    data,
    renderItem,
    toolbarItems,
    toolbarExtra,
    ListEmptyComponent,
    children
}) {
    return (
        <>
            <DrawerList
                data={data}
                renderItem={renderItem}
                ListEmptyComponent={ListEmptyComponent}
            />

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
