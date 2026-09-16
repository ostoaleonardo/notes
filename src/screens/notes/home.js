import { useCallback, useEffect, useMemo, useState } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

import { Intro } from './intro'
import { NoteSearch } from './note-search'
import { RecentNotesSheet } from './recent-notes-sheet'
import { HomeToolbar } from './home-toolbar'
import { AppBar } from '@/components/app-bar/app-bar'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useCurrentNote } from '@/hooks/use-current-note'
import { useImportMarkdown } from '@/hooks/use-import-markdown'
import { useNotes } from '@/hooks/use-notes'
import { usePro } from '@/hooks/use-pro'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useUtils } from '@/hooks/use-utils'
import { getRecentIds } from '@/utils/recent-ids'

import { ROUTES } from '@/constants/routes'

export function Home() {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { pinned } = useUtils()
    const { pro } = usePro()
    const { recent } = useRecentNotes()
    const { listTemplates } = useTemplates()
    const { importFile } = useImportMarkdown()
    const { registerCurrent } = useCurrentNote()
    const { activeRepositoryTree } = useRepositories()

    const [templates, setTemplates] = useState([])
    const rootId = activeRepositoryTree[0]?.id

    const recentCount = useMemo(
        () => getRecentIds(pinned, recent, notes, templates).length,
        [pinned, recent, notes, templates]
    )

    const recentsSheet = useBottomSheet()

    useFocusEffect(
        useCallback(() => {
            registerCurrent('')
        }, [])
    )

    useEffect(() => {
        listTemplates().then(setTemplates)
    }, [])

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
                title={t('title.notes') + (pro ? ' (Pro)' : '')}
            />

            <View style={styles.container}>
                <NoteSearch />
                <Intro />
            </View>

            <HomeToolbar
                onCreateNote={onCreateNote}
                onImportNote={onImportNote}
                onOpenRecents={recentsSheet.onOpen}
                recentCount={recentCount}
            />

            <RecentNotesSheet
                home={true}
                sheet={recentsSheet}
            />
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
