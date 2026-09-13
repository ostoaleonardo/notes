import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { AddSubfolder } from '@/screens/modals/add-subfolder'
import { AddTemplate } from '@/screens/modals/add-template'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import { DrawerHeader } from './drawer-header'
import { DrawerScreen } from './drawer-screen'
import { DrawerNoteItem } from './drawer-note-item'
import { DrawerRepositoryItem } from './drawer-repository-item'
import { DrawerTemplatesSection } from './drawer-templates-section'
import { Separator } from '@/components/separator/separator'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useTags } from '@/hooks/use-tags'
import { useTemplates } from '@/hooks/use-templates'
import { useUtils } from '@/hooks/use-utils'
import { buildRepositoryTree, flattenDrawerTree } from '@/utils/drawer-tree'
import { getEditorPath } from '@/utils/editor-path'

import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX, TEMPLATES_SECTION_ID } from '@/constants/tabs'

const DRAWER_SPACING = 12

export function DrawerItems({ navigation }) {
    const { t } = useTranslation()
    const { tags } = useTags()
    const { notes } = useNotes()
    const { listTemplates } = useTemplates()
    const { currentId } = useCurrentNote()
    const insets = useSafeAreaInsets()

    const {
        collapsedFolders,
        collapseAll,
        expandAll,
        toggleFolder
    } = useUtils()

    const {
        activeRepositoryTree,
        activeRepository,
        activeRepositoryId,
        setActiveRepository
    } = useRepositories()

    const [templates, setTemplates] = useState([])
    const [addTemplateVisible, setAddTemplateVisible] = useState(false)
    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const refreshTemplates = () => listTemplates().then(setTemplates)

    useEffect(() => {
        refreshTemplates()
    }, [activeRepository?.id])

    const notesByRepository = useMemo(() => {
        const map = new Map()
        notes.forEach((note) => {
            if (!map.has(note.repositoryId)) map.set(note.repositoryId, [])
            map.get(note.repositoryId).push(note)
        })
        return map
    }, [notes])

    const tree = useMemo(
        () => buildRepositoryTree(activeRepositoryTree, notesByRepository),
        [activeRepositoryTree, notesByRepository]
    )

    const rows = useMemo(
        () => flattenDrawerTree(tree, collapsedFolders),
        [tree, collapsedFolders]
    )

    const closeDrawer = useCallback(() => {
        navigation.dispatch({ type: 'CLOSE_DRAWER' })
    }, [navigation])

    const onOpenRoot = useCallback((id) => {
        if (id !== activeRepositoryId) setActiveRepository(id)
    }, [activeRepositoryId, setActiveRepository])

    const onOpenNote = useCallback((id) => {
        closeDrawer()
        if (id === currentId) return

        const path = getEditorPath(id)
        if (currentId) {
            router.replace(path)
        } else {
            router.push(path)
        }
    }, [closeDrawer, currentId])

    const onCreateNote = useCallback((repositoryId) => {
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId }
        })
        closeDrawer()
    }, [closeDrawer])

    const onOpenTemplate = useCallback((filename) => {
        const path = getEditorPath(TEMPLATE_TAB_PREFIX + filename)
        if (currentId) {
            router.replace(path)
        } else {
            router.push(path)
        }
        closeDrawer()
    }, [closeDrawer, currentId])

    const onToggleCollapseAll = () => {
        if (collapsedFolders.size > 0) {
            expandAll()
        } else {
            collapseAll(activeRepositoryTree.map((repository) => repository.id))
        }
    }

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'note') {
            return (
                <DrawerNoteItem
                    note={item.note}
                    depth={item.depth}
                    active={item.note.id === currentId}
                    onOpenNote={onOpenNote}
                />
            )
        }

        return (
            <DrawerRepositoryItem
                repository={item.repository}
                depth={item.depth}
                isCollapsed={item.isCollapsed}
                active={item.repository.id === activeRepositoryId}
                onOpenRoot={onOpenRoot}
                onCreateNote={onCreateNote}
                onAddSubfolder={setSubfolderParentId}
                onEditFolder={setEditFolderId}
                onDelete={setDeleteId}
            />
        )
    }, [currentId, activeRepositoryId, onOpenNote, onOpenRoot, onCreateNote])

    return (
        <>
            <FlatList
                data={rows}
                keyExtractor={(row) => row.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={{
                    paddingTop: DRAWER_SPACING + insets.top,
                    paddingBottom: DRAWER_SPACING + insets.bottom,
                    paddingStart: DRAWER_SPACING + insets.left,
                    paddingEnd: DRAWER_SPACING + insets.right
                }}
                ListHeaderComponent={(
                    <DrawerHeader
                        collapsed={collapsedFolders.size > 0}
                        onToggleCollapseAll={onToggleCollapseAll}
                    />
                )}
                ListFooterComponent={(
                    <View>
                        <Separator style={styles.separator} />

                        <DrawerTemplatesSection
                            templates={templates}
                            activeFilename={currentId.startsWith(TEMPLATE_TAB_PREFIX) ? currentId.slice(TEMPLATE_TAB_PREFIX.length) : ''}
                            collapsed={collapsedFolders.has(TEMPLATES_SECTION_ID)}
                            onToggleCollapse={() => toggleFolder(TEMPLATES_SECTION_ID)}
                            onOpenTemplate={onOpenTemplate}
                            onAddTemplate={() => setAddTemplateVisible(true)}
                        />

                        <Separator style={styles.separator} />

                        <View>
                            <DrawerScreen
                                path={ROUTES.TAGS}
                                label={t('drawer.tags')}
                                indicator={t('count.tags', { count: tags?.length || 0 })}
                            />
                            <DrawerScreen
                                path={ROUTES.SETTINGS}
                                label={t('title.settings')}
                            />
                        </View>
                    </View>
                )}
            />

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
            <AddTemplate
                visible={addTemplateVisible}
                onDismiss={() => {
                    setAddTemplateVisible(false)
                    refreshTemplates()
                    closeDrawer()
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    },
    separator: {
        marginVertical: 12
    }
})
