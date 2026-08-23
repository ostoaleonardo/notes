import { useEffect, useState } from 'react'
import { AppState, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { DrawerContentScrollView } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerScreen } from './drawer-screen'
import { DrawerRepositoryItem } from './drawer-repository-item'
import { Separator } from '../separator'
import { Typography } from '../typography'
import { AddSubfolder } from '@/screens/modals/add-subfolder'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import { ROUTES } from '@/constants'
import { useTags, useFileStorage, useIconProps, useRepositories, useTemplates, useTrash } from '@/hooks'
import { ArrowForward } from '@/icons'
import { IconButton } from 'react-native-paper'

export function DrawerItems() {
    const { t } = useTranslation()
    const { trash } = useTrash()
    const { tags } = useTags()
    const { listTemplates } = useTemplates()
    const { listMarkdownFiles } = useFileStorage()
    const iconProps = useIconProps(16)

    const {
        activeRepositoryTree,
        activeRepository,
        activeRepositoryId,
        setActiveRepository
    } = useRepositories()

    const [counts, setCounts] = useState({})
    const [templatesCount, setTemplatesCount] = useState(0)
    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    useEffect(() => {
        const refreshCounts = () => {
            const next = {}
            activeRepositoryTree.forEach((repository) => {
                next[repository.id] = listMarkdownFiles(repository.uri).length
            })
            setCounts(next)
        }

        refreshCounts()

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshCounts()
        })

        return () => subscription.remove()
    }, [activeRepositoryTree])

    useEffect(() => {
        listTemplates().then((list) => setTemplatesCount(list.length))
    }, [activeRepository?.id])

    const onOpenRepository = (id) => {
        setActiveRepository(id)
        router.push(ROUTES.HOME)
    }

    return (
        <DrawerContentScrollView>
            <View>
                <Pressable
                    style={styles.header}
                    onPress={() => router.push(ROUTES.REPOSITORIES)}
                    accessibilityLabel={t('drawer.repositories')}
                >
                    <Typography
                        bold
                        uppercase
                        opacity={0.6}
                        variant='caption'
                    >
                        {t('drawer.repositories')}
                    </Typography>

                    <IconButton
                        pointerEvents='none'
                        importantForAccessibility='no'
                        icon={() => <ArrowForward {...iconProps} opacity={0.6} />}
                    />
                </Pressable>

                {activeRepositoryTree.map((repository) => (
                    <DrawerRepositoryItem
                        key={repository.id}
                        repository={repository}
                        count={t('count.notes', { count: counts[repository.id] || 0 })}
                        active={repository.id === activeRepositoryId}
                        onOpen={() => onOpenRepository(repository.id)}
                        onAddSubfolder={() => setSubfolderParentId(repository.id)}
                        onEditFolder={() => setEditFolderId(repository.id)}
                        onDelete={() => setDeleteId(repository.id)}
                    />
                ))}

                <Separator style={styles.separator} />

                <View>
                    <DrawerScreen
                        path={ROUTES.TEMPLATES}
                        label={t('drawer.templates')}
                        indicator={t('count.templates', { count: templatesCount })}
                    />
                    <DrawerScreen
                        path={ROUTES.TAGS}
                        label={t('drawer.tags')}
                        indicator={t('count.tags', { count: tags?.length || 0 })}
                    />
                    <DrawerScreen
                        path={ROUTES.TRASH}
                        label={t('drawer.trash')}
                        indicator={t('count.notes', { count: trash?.size || 0 })}
                    />
                </View>
            </View>

            <RenameRepository
                visible={!!editFolderId}
                repositoryId={editFolderId}
                onDismiss={() => setEditFolderId('')}
            />
            <AddSubfolder
                visible={!!subfolderParentId}
                parentId={subfolderParentId}
                onDismiss={() => setSubfolderParentId('')}
            />
            <DeleteRepository
                visible={!!deleteId}
                repositoryId={deleteId}
                onDismiss={() => setDeleteId('')}
            />
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingLeft: 16,
        paddingRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    separator: {
        marginHorizontal: 16,
        marginTop: 8
    }
})
