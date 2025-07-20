import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote } from '@/screens'
import { useBottomSheet, useMarkdown, useNotes, useUtils } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const { deleteNote } = useNotes()
    const { initMarkdown } = useMarkdown()
    const { filter, onFilter, pinned, updatePinned } = useUtils()

    const [selectedNote, setSelectedNote] = useState(null)

    const {
        ref: deleteBottomRef,
        onOpen: onOpenDelete,
        onClose: onCloseDelete
    } = useBottomSheet()

    const onPin = (id) => {
        if (pinned.has(id)) {
            pinned.delete(id)
        } else {
            pinned.add(id)
            onCloseDelete()
        }

        updatePinned(new Set(pinned))
    }

    const onDelete = (id, isLocked) => {
        if (isLocked) {
            setSelectedNote(id)
            onOpenDelete()
        } else {
            deleteNote(id)
        }
    }

    useState(() => initMarkdown(), [])

    return (
        <View style={{ flex: 1 }}>
            <FilterCarousel
                filter={filter}
                onFilter={onFilter}
            />
            <NotesContainer
                pinned={pinned}
                onPin={onPin}

                filter={filter}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}

                onDelete={onDelete}
            />

            <FloatingButton
                label={t('button.addNote')}
                href={ROUTES.ADD_NOTE}
            />

            <DeleteNote
                ref={deleteBottomRef}
                id={selectedNote}
                onClose={() => {
                    setSelectedNote(null)
                    onCloseDelete()
                }}
            />
        </View>
    )
}
