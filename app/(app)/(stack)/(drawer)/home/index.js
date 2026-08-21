import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton, ModalSheet } from '@/components'
import { DeleteNote, UnlockNote } from '@/screens/modals'
import { FilterCarousel, NotesContainer } from '@/screens/home'
import { useBottomSheet, useNotes, useTrash, useUtils } from '@/hooks'
import { ROUTES } from '@/constants'
import { Plus } from '@/icons'

export default function App() {
    const { t } = useTranslation()
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

    const onCloseUnlockNote = useCallback(() => {
        setOpen(null)
        onCloseUnlock()
    }, [onCloseUnlock])

    const onCloseDeleteNote = useCallback(() => {
        setSelected(null)
        onCloseDelete()
    }, [onCloseDelete])

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
                icon={<Plus />}
                href={ROUTES.ADD_NOTE}
            />

            <ModalSheet
                enableDynamicSizing
                ref={unlockBottomRef}
                onClose={onCloseUnlockNote}
                title={t('title.unlock')}
            >
                <UnlockNote
                    id={open}
                    onClose={onCloseUnlockNote}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={deleteBottomRef}
                onClose={onCloseDeleteNote}
                title={t('notes.delete')}
            >
                <DeleteNote
                    id={selected}
                    onClose={onCloseDeleteNote}
                />
            </ModalSheet>
        </View>
    )
}
