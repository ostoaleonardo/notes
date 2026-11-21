import { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { RepositoryItem } from '@/features/repositories/screens/repositories/repository-item'
import { DeleteRepository } from '@/screens/dialogs/delete-repository'
import { ForgetRepository } from '@/screens/dialogs/forget-repository'
import { RenameRepository } from '@/screens/dialogs/rename-repository'
import { AnimatedList } from '@/ui/animated/animated-list'
import { FloatingActionButton } from '@/ui/button/floating-action-button'
import { GroupedList } from '@/ui/grouped-list'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

import { useFileStorage } from '@/shared/hooks/use-file-storage'
import { useOnForeground } from '@/shared/hooks/use-on-foreground'
import { usePro } from '@/shared/hooks/use-pro'
import { useFolders } from '@/shared/hooks/use-folders'
import { useSingleFlight } from '@/shared/hooks/use-single-flight'
import { getFolderNoteCounts } from '@/shared/utils/folder-note-counts'

import { Folder } from '@/icons/folder'

import { ROUTES } from '@/shared/constants/routes'
import { FREE_REPOSITORIES_LIMIT } from '@/shared/constants/default-values'
import { SPACING } from '@/shared/constants/theme'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'
import { TEST_IDS } from '@/shared/constants/test-ids'

export default function Repositories() {
    const { t } = useTranslation()
    const { bottom } = useSafeAreaInsets()
    const { pro } = usePro()
    const { scanMarkdownFiles } = useFileStorage()

    const {
        folders,
        activeFolderId,
        addRepository,
        setActiveFolder
    } = useFolders()

    const rootRepositories = useMemo(() => (
        folders.filter((folder) => !folder.parentId)
    ), [folders])

    const [counts, setCounts] = useState({})
    const [renameId, setRenameId] = useState('')
    const [forgetId, setForgetId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const refreshCounts = useCallback(() => (
        getFolderNoteCounts(rootRepositories, scanMarkdownFiles).then(setCounts)
    ), [rootRepositories, scanMarkdownFiles])

    useEffect(() => {
        refreshCounts()
    }, [refreshCounts])
    useOnForeground(refreshCounts)

    const canAddRepository = pro || rootRepositories.length < FREE_REPOSITORIES_LIMIT

    const [onAddRepository] = useSingleFlight(async () => {
        if (!canAddRepository) {
            showSnackbar(t('repositories.pro_required'))
            return
        }

        const result = await addRepository()
        if (result === REPOSITORY_RESULTS.DUPLICATE) {
            showSnackbar(t('repositories.already_added'))
        } else if (result === REPOSITORY_RESULTS.ERROR) {
            showSnackbar(t('repositories.add_failed'))
        }
    })

    const onOpen = useCallback((id) => {
        setActiveFolder(id)
        router.replace(ROUTES.HOME)
    }, [setActiveFolder])

    const keyExtractor = useCallback((folder) => folder.id, [])
    const onDismissRename = useCallback(() => setRenameId(''), [])
    const onDismissForget = useCallback(() => setForgetId(''), [])
    const onDismissDelete = useCallback(() => setDeleteId(''), [])

    const renderItem = useCallback(({ item }) => (
        <RepositoryItem
            folder={item}
            count={t('count.notes', { count: counts[item.id] || 0 })}
            active={item.id === activeFolderId}
            onOpen={onOpen}
            onRename={setRenameId}
            onForget={setForgetId}
            onDelete={setDeleteId}
        />
    ), [t, counts, activeFolderId, onOpen])

    return (
        <View style={{ flex: 1 }}>
            <GroupedList
                component={AnimatedList}
                contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: bottom }}
                gap={SPACING.xxxs}
                data={rootRepositories}
                keyExtractor={keyExtractor}
                emptyLabel={t('message.notes.empty')}
                renderItem={renderItem}
            />

            <FloatingActionButton
                icon={Folder}
                label={t('repositories.choose.button')}
                onPress={onAddRepository}
                testID={TEST_IDS.REPOSITORIES_ADD}
            />

            <RenameRepository
                visible={!!renameId}
                folderId={renameId}
                onDismiss={onDismissRename}
            />
            <ForgetRepository
                visible={!!forgetId}
                folderId={forgetId}
                onDismiss={onDismissForget}
            />
            <DeleteRepository
                visible={!!deleteId}
                folderId={deleteId}
                onDismiss={onDismissDelete}
            />
        </View>
    )
}
