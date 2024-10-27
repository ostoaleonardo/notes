import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote } from '@/screens'
import { useBottomSheet, useNotes, useUtils } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const { deleteNote } = useNotes()
    const { pinned, updatePinned } = useUtils()
    const { ref, onOpen, onClose } = useBottomSheet()

    const [filter, setFilter] = useState(new Set())
    const [selectedNote, setSelectedNote] = useState(null)

    const onFilter = (id) => {
        if (id === 'all') {
            setFilter(new Set())
            return
        }

        if (filter.has(id)) {
            filter.delete(id)
        } else {
            filter.add(id)
        }

        setFilter(new Set(filter))
    }

    const onPin = (id) => {
        if (pinned.has(id)) {
            pinned.delete(id)
        } else {
            pinned.add(id)
            onClose()
        }

        updatePinned(new Set(pinned))
    }

    const onDelete = (id, isLocked) => {
        if (isLocked) {
            setSelectedNote(id)
            onOpen()
        } else {
            deleteNote(id)
        }
    }

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
                ref={ref}
                id={selectedNote}
                onClose={() => {
                    setSelectedNote(null)
                    onClose()
                }}
            />
        </View>
    )
}
