import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel } from '@/screens'
import { useHeaderTitle } from '@/hooks'
import { COLORS } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const [filteredNotes, setFilteredNotes] = useState([])

    useHeaderTitle(t('header.notes'))

    return (
        <View style={styles.container}>
            <FilterCarousel setFilteredNotes={setFilteredNotes} />
            <NotesContainer filteredNotes={filteredNotes} />
            <FloatingButton label={t('button.addNote')} href='/note' />
            <StatusBar style='auto' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
})
