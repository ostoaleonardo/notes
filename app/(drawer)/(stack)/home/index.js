import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { NotesFilter, FloatingButton, NotesContainer } from '@/components'
import { useHeaderTitle } from '@/hooks'
import { colors } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const [filteredNotes, setFilteredNotes] = useState([])

    useHeaderTitle(t('header.notes'))

    return (
        <View style={styles.container}>
            <NotesFilter setFilteredNotes={setFilteredNotes} />
            <NotesContainer filteredNotes={filteredNotes} />
            <FloatingButton label={t('button.addNote')} href='/note' />
            <StatusBar style='auto' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
})
