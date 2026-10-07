import { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { RepositoryItem } from '@/screens/repositories/repository-item'
import { DeleteRepository } from '@/screens/dialogs/delete-repository'
import { ForgetRepository } from '@/screens/dialogs/forget-repository'
import { RenameRepository } from '@/screens/dialogs/rename-repository'
import { AnimatedList } from '@/components/animated/animated-list'
import { FloatingButton } from '@/components/button/floating-button'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useFileStorage } from '@/hooks/use-file-storage'
import { useOnForeground } from '@/hooks/use-on-foreground'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { getRepositoryNoteCounts } from '@/utils/repository-note-counts'

import { Folder } from '@/icons/folder'

import { ROUTES } from '@/constants/routes'
import { FREE_REPOSITORIES_LIMIT } from '@/constants/default-values'
import { SPACING } from '@/constants/theme'
import { REPOSITORY_RESULTS } from '@/constants/repository-results'

export default function Repositories() {
    const { t } = useTranslation()
    const { pro } = usePro()
    const { listMarkdownFiles } = useFileStorage()

    const {
        repositories,
        activeRepositoryId,
        addRepository,
        setActiveRepository
    } = useRepositories()

    const rootRepositories = useMemo(() => (
        repositories.filter((repository) => !repository.parentId)
    ), [repositories])

    const [counts, setCounts] = useState({})
    const [renameId, setRenameId] = useState('')
    const [forgetId, setForgetId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const refreshCounts = useCallback(() => (
        setCounts(getRepositoryNoteCounts(rootRepositories, listMarkdownFiles))
    ), [rootRepositories, listMarkdownFiles])

    useEffect(() => {
        refreshCounts()
    }, [refreshCounts])
    useOnForeground(refreshCounts)

    const canAddRepository = pro || rootRepositories.length < FREE_REPOSITORIES_LIMIT

    const onAddRepository = useCallback(async () => {
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
    }, [canAddRepository, addRepository, t])

    const onOpen = useCallback((id) => {
        setActiveRepository(id)
        router.replace(ROUTES.HOME)
    }, [setActiveRepository])

    const keyExtractor = useCallback((repository) => repository.id, [])
    const onDismissRename = useCallback(() => setRenameId(''), [])
    const onDismissForget = useCallback(() => setForgetId(''), [])
    const onDismissDelete = useCallback(() => setDeleteId(''), [])

    const renderItem = useCallback(({ item, index }) => (
        <RepositoryItem
            repository={item}
            count={t('count.notes', { count: counts[item.id] || 0 })}
            active={item.id === activeRepositoryId}
            onOpen={onOpen}
            onRename={setRenameId}
            onForget={setForgetId}
            onDelete={setDeleteId}
            isFirst={index === 0}
            isLast={index === rootRepositories.length - 1}
        />
    ), [t, counts, activeRepositoryId, onOpen, rootRepositories.length])

    return (
        <View style={{ flex: 1 }}>
            <AnimatedList
                contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
                gap={SPACING.xxxs}
                data={rootRepositories}
                keyExtractor={keyExtractor}
                emptyLabel={t('message.notes.empty')}
                renderItem={renderItem}
            />

            <FloatingButton
                icon={<Folder />}
                label={t('repositories.choose_button')}
                onPress={onAddRepository}
            />

            <RenameRepository
                visible={!!renameId}
                repositoryId={renameId}
                onDismiss={onDismissRename}
            />
            <ForgetRepository
                visible={!!forgetId}
                repositoryId={forgetId}
                onDismiss={onDismissForget}
            />
            <DeleteRepository
                visible={!!deleteId}
                repositoryId={deleteId}
                onDismiss={onDismissDelete}
            />
        </View>
    )
}
