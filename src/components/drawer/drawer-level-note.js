import { memo, useCallback } from 'react'

import { TreeRow } from '@/ui/tree-row'

import { useIsCurrentNote } from '@/hooks/use-is-current-note'

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

export const DrawerCurrentAwareNote = memo(({ note, ...props }) => {
    const active = useIsCurrentNote(note.path)

    return (
        <DrawerLevelNote
            note={note}
            active={active}
            {...props}
        />
    )
})
