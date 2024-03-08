import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Categories, FloatingButton, NotesContainer } from '@/components'
import { useHeaderTitle } from '@/hooks'
import { colors } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const [filteredNotes, setFilteredNotes] = useState([])

    useHeaderTitle(t('headerTitle.notes'))

    return (
        <View style={styles.container}>
            <Categories setFilteredNotes={setFilteredNotes} />
            <NotesContainer filteredNotes={filteredNotes} />
            <FloatingButton label={t('buttons.addNote')} href='/note' />
            <StatusBar style='inverted' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
})
