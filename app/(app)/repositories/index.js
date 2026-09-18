import { useEffect, useState } from 'react'
import { AppState, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { RepositoryItem } from '@/screens/repositories/repository-item'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { ForgetRepository } from '@/screens/modals/forget-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import { AnimatedList } from '@/components/animated/animated-list'
import { FloatingButton } from '@/components/button/floating-button'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useFileStorage } from '@/hooks/use-file-storage'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'

import { Folder } from '@/icons/folder'

import { ROUTES } from '@/constants/routes'
import { FREE_REPOSITORIES_LIMIT } from '@/constants/default-values'

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

    const rootRepositories = repositories.filter((repository) => !repository.parentId)

    const [counts, setCounts] = useState({})
    const [renameId, setRenameId] = useState('')
    const [forgetId, setForgetId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    useEffect(() => {
        const refreshCounts = () => {
            const next = {}
            rootRepositories.forEach((repository) => {
                next[repository.id] = listMarkdownFiles(repository.uri).length
            })
            setCounts(next)
        }

        refreshCounts()

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshCounts()
        })

        return () => subscription.remove()
    }, [repositories])

    const canAddRepository = pro || rootRepositories.length < FREE_REPOSITORIES_LIMIT

    const onAddRepository = async () => {
        if (!canAddRepository) {
            showSnackbar(t('repositories.pro_required'))
            return
        }

        const result = await addRepository()
        if (result === 'duplicate') {
            showSnackbar(t('repositories.already_added'))
        }
    }

    const onOpen = (id) => {
        setActiveRepository(id)
        router.replace(ROUTES.HOME)
    }

    return (
        <View style={{ flex: 1 }}>
            <AnimatedList
                contentContainerStyle={{ paddingHorizontal: 16 }}
                gap={2}
                data={rootRepositories}
                keyExtractor={(repository) => repository.id}
                emptyLabel={t('message.notes.empty')}
                renderItem={({ item, index }) => (
                    <RepositoryItem
                        repository={item}
                        count={t('count.notes', { count: counts[item.id] || 0 })}
                        active={item.id === activeRepositoryId}
                        onOpen={() => onOpen(item.id)}
                        onRename={() => setRenameId(item.id)}
                        onForget={() => setForgetId(item.id)}
                        onDelete={() => setDeleteId(item.id)}
                        isFirst={index === 0}
                        isLast={index === rootRepositories.length - 1}
                    />
                )}
            />

            <FloatingButton
                icon={<Folder />}
                onPress={onAddRepository}
            />

            <RenameRepository
                visible={!!renameId}
                repositoryId={renameId}
                onDismiss={() => setRenameId('')}
            />
            <ForgetRepository
                visible={!!forgetId}
                repositoryId={forgetId}
                onDismiss={() => setForgetId('')}
            />
            <DeleteRepository
                visible={!!deleteId}
                repositoryId={deleteId}
                onDismiss={() => setDeleteId('')}
            />
        </View>
    )
}
