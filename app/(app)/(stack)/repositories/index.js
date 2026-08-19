import { useEffect, useState } from 'react'
import { AppState, ToastAndroid, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AnimatedList, FloatingButton } from '@/components'
import { RepositoryItem } from '@/screens/repositories'
import { DeleteRepository, ForgetRepository, RenameRepository } from '@/screens/modals'
import { useFileStorage, usePremium, useRepositories } from '@/hooks'
import { ROUTES } from '@/constants'
import { Folder } from '@/icons'

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

    const [counts, setCounts] = useState({})
    const [renameId, setRenameId] = useState('')
    const [forgetId, setForgetId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    useEffect(() => {
        const refreshCounts = () => {
            const next = {}
            repositories.forEach((repository) => {
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

    const canAddRepository = premium || repositories.length === 0

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
        router.push(ROUTES.HOME)
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <AnimatedList
                gap={2}
                data={repositories}
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
                        isLast={index === repositories.length - 1}
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
