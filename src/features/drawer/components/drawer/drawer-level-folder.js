import { memo, useCallback } from 'react'
import { View } from 'react-native'

import { DrawerFolderActions } from './drawer-folder-actions'
import { TreeRow } from '@/ui/tree-row'

import { useMenuAction } from '@/hooks/use-menu-action'

export const DrawerLevelFolder = memo(({
    repository,
    onEnter,
    onAction
}) => {
    const menu = useMenuAction()

    const onPress = useCallback(() => onEnter(repository.id), [onEnter, repository.id])

    const handleAction = useCallback((action) => {
        onAction(action, repository.id)
    }, [onAction, repository.id])

    return (
        <View>
            <TreeRow
                collapsed
                label={repository.alias}
                onPress={onPress}
                onLongPress={menu.onOpen}
            />
            <DrawerFolderActions menu={menu} onAction={handleAction} />
        </View>
    )
})
