import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote, UnlockNote } from '@/screens'
import { useBottomSheet, useMarkdown, useNotes, useUtils } from '@/hooks'
import { ROUTES } from '@/constants'
import { useTrash } from '@/hooks/useTrash'

export default function App() {
    const { t } = useTranslation()
    const { addItem } = useTrash()
    const { deleteNote } = useNotes()
    const { initMarkdown } = useMarkdown()

    const [open, setOpen] = useState(null)
    const [selected, setSelected] = useState(null)

    const {
        filter, onFilter,
        pinned, updatePinned
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

    const onUnlock = (id) => {
        setOpen(id)
        onOpenUnlock()
    }

    const onPin = (id) => {
        if (pinned.has(id)) {
            pinned.delete(id)
        } else {
            pinned.add(id)
            onCloseDelete()
        }

        updatePinned(new Set(pinned))
    }

    const onDelete = (note, isLocked) => {
        if (isLocked) {
            setSelected(note.id)
            onOpenDelete()
        } else {
            deleteNote(note.id)
            addItem(note)
        }
    }

    console.log(selected)

    useState(() => initMarkdown(), [])

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
                label={t('button.addNote')}
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
