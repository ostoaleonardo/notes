import { memo, useCallback } from 'react'

import { TreeRow } from '@/ui/tree-row'

export const DrawerLevelNote = memo(({
    note,
    depth = 0,
    active,
    showSlot = true,
    onOpenNote
}) => {
    const onPress = useCallback(() => onOpenNote(note.path), [onOpenNote, note.path])

    return (
        <TreeRow
            label={note.title}
            depth={depth}
            active={!!active}
            expandable={false}
            showSlot={showSlot}
            onPress={onPress}
        />
    )
})
