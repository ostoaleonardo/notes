import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote } from '@/screens'
import { useBottomSheet, useHeaderTitle } from '@/hooks'

export default function App() {
    const { t } = useTranslation()
    const { ref, onOpen, onClose } = useBottomSheet()
    const [selectedNote, setSelectedNote] = useState(null)
    const [filteredNotes, setFilteredNotes] = useState([])

    useHeaderTitle(t('header.notes'))

    return (
        <View style={{ flex: 1 }}>
            <FilterCarousel setFilteredNotes={setFilteredNotes} />
            <NotesContainer
                onOpen={onOpen}
                filteredNotes={filteredNotes}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
            />

            <FloatingButton
                label={t('button.addNote')}
                href='/note'
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
