import { useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import * as DocumentPicker from 'expo-document-picker'

import { AppBar, ModalSheet, Pressable, RecentsButton } from '@/components'
import { Intro } from './intro'
import { NoteSearch } from './note-search'
import { RecentNotes } from './recent-notes'
import { useBottomSheet, useCurrentNote, useIconProps, useImportMarkdown, useRecentNotes, useRepositories } from '@/hooks'
import { Plus } from '@/icons'
import { ROUTES } from '@/constants'

export function Home() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { activeRepositoryTree } = useRepositories()
    const { importFile } = useImportMarkdown()
    const { registerCurrent } = useCurrentNote()
    const { recent } = useRecentNotes()
    const iconProps = useIconProps()
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

                <Intro onCreateNote={onCreateNote} />

                <Pressable
                    mode='text'
                    onPress={onImportNote}
                >
                    {t('title.import')}
                </Pressable>
            </View>

            <View
                style={{
                    ...styles.toolbar,
                    borderTopColor: colors.outline,
                    backgroundColor: colors.background
                }}
            >
                <IconButton
                    onPress={onCreateNote}
                    icon={() => <Plus {...iconProps} />}
                    accessibilityLabel={t('notes.create')}
                />

                <RecentsButton
                    onPress={recentsSheet.onOpen}
                    count={recent.length}
                />
            </View>

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
    },
    toolbar: {
        paddingVertical: 3,
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1
    }
})
