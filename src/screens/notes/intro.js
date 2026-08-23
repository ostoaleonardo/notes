import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

import { Pressable } from '@/components'
import { IntroWelcome } from './intro-welcome'
import { NoteSearch } from './note-search'
import { useImportMarkdown, useRepositories } from '@/hooks'
import { ROUTES } from '@/constants'

export function Intro() {
    const { t } = useTranslation()
    const { activeRepositoryTree } = useRepositories()
    const { importFile } = useImportMarkdown()
    const rootId = activeRepositoryTree[0]?.id

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
        <View style={styles.container}>
            <NoteSearch />

            <IntroWelcome onCreateNote={onCreateNote} />

            <Pressable
                mode='text'
                onPress={onImportNote}
            >
                {t('title.import')}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 24,
        alignItems: 'center'
    }
})
