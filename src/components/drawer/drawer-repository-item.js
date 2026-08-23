import { DrawerNoteItem } from './drawer-note-item'
import { DrawerRepositoryRow } from './drawer-repository-row'
import { useUtils } from '@/hooks'

export function DrawerRepositoryItem({
    repository,
    depth,
    active,
    activeNoteId,
    subfolders,
    notes,
    onOpenRoot,
    onOpenNote,
    onAddSubfolder,
    onCreateNote,
    onEditFolder,
    onDelete
}) {
    const { collapsedFolders, toggleFolder } = useUtils()

    const isRoot = depth === 0
    const isCollapsed = collapsedFolders.has(repository.id)

    const onPress = () => {
        if (isRoot) onOpenRoot(repository.id)
        toggleFolder(repository.id)
    }

    return (
        <>
            <DrawerRepositoryRow
                alias={repository.alias}
                isRoot={isRoot}
                active={active}
                isCollapsed={isCollapsed}
                depth={depth}
                onPress={onPress}
                onCreateNote={() => onCreateNote(repository.id)}
                onAddSubfolder={onAddSubfolder}
                onEditFolder={onEditFolder}
                onDelete={onDelete}
            />

            {!isCollapsed && (
                <>
                    {notes.map((note) => (
                        <DrawerNoteItem
                            key={note.id}
                            note={note}
                            depth={depth + 1}
                            active={note.id === activeNoteId}
                            onPress={() => onOpenNote(note.id)}
                        />
                    ))}

                    {subfolders.map((subfolder) => (
                        <DrawerRepositoryItem
                            key={subfolder.repository.id}
                            {...subfolder}
                            depth={depth + 1}
                            active={active}
                            activeNoteId={activeNoteId}
                            onOpenRoot={onOpenRoot}
                            onOpenNote={onOpenNote}
                            onAddSubfolder={() => onAddSubfolder(subfolder.repository.id)}
                            onCreateNote={onCreateNote}
                            onEditFolder={() => onEditFolder(subfolder.repository.id)}
                            onDelete={() => onDelete(subfolder.repository.id)}
                        />
                    ))}
                </>
            )}
        </>
    )
}
