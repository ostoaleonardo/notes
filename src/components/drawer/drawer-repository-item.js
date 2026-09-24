import { memo } from 'react'

import { AnimatedView } from '@/components/animated/animated-view'
import { DrawerRepositoryRow } from './drawer-repository-row'

import { useUtils } from '@/hooks/use-utils'

export const DrawerRepositoryItem = memo(function DrawerRepositoryItem({
    repository,
    depth,
    active,
    isCollapsed,
    onOpenRoot,
    onAction
}) {
    const { toggleFolder } = useUtils()

    const isRoot = depth === 0

    const onPress = () => {
        if (isRoot) onOpenRoot(repository.id)
        toggleFolder(repository.id)
    }

    return (
        <AnimatedView>
            <DrawerRepositoryRow
                alias={repository.alias}
                isRoot={isRoot}
                active={active}
                isCollapsed={isCollapsed}
                depth={depth}
                onPress={onPress}
                onAction={(action) => onAction(action, repository.id)}
            />
        </AnimatedView>
    )
})
