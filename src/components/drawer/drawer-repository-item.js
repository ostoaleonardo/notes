import { AnimatedView } from '@/components/animated/animated-view'
import { DrawerRepositoryRow } from './drawer-repository-row'

import { useUtils } from '@/hooks/use-utils'

export function DrawerRepositoryItem({
    repository,
    depth,
    active,
    isCollapsed,
    onOpenRoot,
    onAddSubfolder,
    onCreateNote,
    onEditFolder,
    onDelete
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
                onCreateNote={() => onCreateNote(repository.id)}
                onAddSubfolder={() => onAddSubfolder(repository.id)}
                onEditFolder={() => onEditFolder(repository.id)}
                onDelete={() => onDelete(repository.id)}
            />
        </AnimatedView>
    )
}
