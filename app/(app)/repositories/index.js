import { useEffect, useState } from 'react'
import { AppState, ToastAndroid, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { RepositoryItem } from '@/screens/repositories/repository-item'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { ForgetRepository } from '@/screens/modals/forget-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import { AnimatedList } from '@/components/animated/animated-list'
import { FloatingButton } from '@/components/button/floating-button'

import { useFileStorage } from '@/hooks/use-file-storage'
import { usePremium } from '@/hooks/use-premium'
import { useRepositories } from '@/hooks/use-repositories'

import { Folder } from '@/icons/folder'

import { ROUTES } from '@/constants/routes'

export default function Repositories() {
    const { t } = useTranslation()
    const { premium } = usePremium()
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

    const canAddRepository = premium || rootRepositories.length === 0

    const onAddRepository = async () => {
        if (!canAddRepository) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return
        }

        const result = await addRepository()
        if (result === 'duplicate') {
            ToastAndroid.show(t('repositories.already_added'), ToastAndroid.SHORT)
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
