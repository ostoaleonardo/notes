import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote } from '@/screens'
import { useBottomSheet, useNotes } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const { notes, setNotes } = useNotes()
    const { ref, onOpen, onClose } = useBottomSheet()
    const [selectedNote, setSelectedNote] = useState(null)
    const [selectedFilter, setSelectedFilter] = useState('all')

    return (
        <View style={{ flex: 1 }}>
            <FilterCarousel
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
            />
            <NotesContainer
                notes={notes}
                setNotes={setNotes}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
                selectedFilter={selectedFilter}
                onOpen={onOpen}
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
