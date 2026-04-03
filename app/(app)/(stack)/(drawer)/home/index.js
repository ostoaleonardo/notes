import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { FloatingButton } from '@/components'
import { DeleteNote, UnlockNote } from '@/screens/modals'
import { FilterCarousel, NotesContainer } from '@/screens/home'
import { useBottomSheet, useNotes, useTrash, useUtils } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { addItem } = useTrash()
    const { deleteNote } = useNotes()

    const [open, setOpen] = useState(null)
    const [selected, setSelected] = useState(null)

    const {
        filter, onFilter,
        pinned, onPinned
    } = useUtils()

    const {
        ref: unlockBottomRef,
        onOpen: onOpenUnlock,
        onClose: onCloseUnlock
    } = useBottomSheet()

    const {
        ref: deleteBottomRef,
        onOpen: onOpenDelete,
        onClose: onCloseDelete
    } = useBottomSheet()

    const onUnlock = useCallback((id) => {
        setOpen(id)
        onOpenUnlock()
    }, [onOpenUnlock])

    const onPin = useCallback((id) => {
        onPinned(id)

        if (!pinned.has(id)) {
            onCloseDelete()
        }
    }, [onPinned, pinned, onCloseDelete])

    const onDelete = useCallback((note, isLocked) => {
        if (isLocked) {
            setSelected(note.id)
            onOpenDelete()
        } else {
            deleteNote(note.id)
            addItem(note)
        }
    }, [deleteNote, addItem, onOpenDelete])

    return (
        <View style={{ flex: 1 }}>
            <FilterCarousel
                filter={filter}
                onFilter={onFilter}
            />
            <NotesContainer
                filter={filter}
                pinned={pinned}
                onPin={onPin}

                selected={selected}
                setSelected={setSelected}

                onUnlock={onUnlock}
                onDelete={onDelete}
            />

            <FloatingButton
                href={ROUTES.ADD_NOTE}
            />

            <UnlockNote
                ref={unlockBottomRef}
                id={open}
                onClose={() => {
                    setOpen(null)
                    onCloseUnlock()
                }}
            />
            <DeleteNote
                ref={deleteBottomRef}
                id={selected}
                onClose={() => {
                    setSelected(null)
                    onCloseDelete()
                }}
            />
        </View>
    )
}
