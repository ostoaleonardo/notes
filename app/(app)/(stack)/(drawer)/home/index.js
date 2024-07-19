import { useContext, useState } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote } from '@/screens'
import { useBottomSheet } from '@/hooks'
import { ThemeContext } from '@/context'
import { ROUTES } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const { name } = useContext(ThemeContext)
    const { ref, onOpen, onClose } = useBottomSheet()
    const [selectedNote, setSelectedNote] = useState(null)
    const [filteredNotes, setFilteredNotes] = useState([])

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

            <StatusBar style={name === 'light' ? 'dark' : 'light'} />
        </View>
    )
}
