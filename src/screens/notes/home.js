import { useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { AppBar, ModalSheet } from '@/components'
import { Intro } from './intro'
import { NoteSearch } from './note-search'
import { RecentNotes } from './recent-notes'
import { HomeToolbar } from './home-toolbar'
import {
    useBottomSheet,
    useCurrentNote,
    useImportMarkdown,
    useRecentNotes,
    useRepositories
} from '@/hooks'
import { ROUTES } from '@/constants'

export function Home() {
    const { t } = useTranslation()
    const { activeRepositoryTree } = useRepositories()
    const { importFile } = useImportMarkdown()
    const { registerCurrent } = useCurrentNote()
    const { recent } = useRecentNotes()
    const rootId = activeRepositoryTree[0]?.id
    const recentsSheet = useBottomSheet()

    useFocusEffect(
        useCallback(() => {
            registerCurrent('')
        }, [])
    )

    const onCreateNote = () => {
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId: rootId }
        })
    }

    const onImportNote = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        importFile(result.assets[0].uri, result.assets[0].name)
    }

    return (
        <>
            <AppBar
                mode='menu'
                title={t('title.notes')}
            />

            <View style={styles.container}>
                <NoteSearch />

                <Intro />
            </View>

            <HomeToolbar
                onCreateNote={onCreateNote}
                onImportNote={onImportNote}
                onOpenRecents={recentsSheet.onOpen}
                recentCount={recent.length}
            />

            <ModalSheet
                ref={recentsSheet.ref}
                onClose={recentsSheet.onClose}
                title={t('search.recent')}
            >
                <RecentNotes onClose={recentsSheet.onClose} />
            </ModalSheet>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 24,
        alignItems: 'center'
    }
})
