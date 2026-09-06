import { router } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from './drawer-header'
import { DrawerScreen } from './drawer-screen'
import { DrawerNoteItem } from './drawer-note-item'
import { DrawerRepositoryItem } from './drawer-repository-item'
import { DrawerTemplatesSection } from './drawer-templates-section'
import { Separator } from '../separator'
import { AddSubfolder } from '@/screens/modals/add-subfolder'
import { AddTemplate } from '@/screens/modals/add-template'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import {
    useCurrentNote,
    useNotes,
    useRepositories,
    useTags,
    useTemplates,
    useUtils
} from '@/hooks'
import {
    buildRepositoryTree,
    flattenDrawerTree,
    getEditorPath
} from '@/utils'
import {
    ROUTES,
    TEMPLATE_TAB_PREFIX,
    TEMPLATES_SECTION_ID
} from '@/constants'

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

    const closeDrawer = () => {
        navigation.dispatch({ type: 'CLOSE_DRAWER' })
    }

    const onOpenRoot = (id) => {
        if (id !== activeRepositoryId) setActiveRepository(id)
    }

    const onOpenNote = (id) => {
        router.push(getEditorPath(id))
        closeDrawer()
    }

    const onCreateNote = (repositoryId) => {
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId }
        })
        closeDrawer()
    }

    const onOpenTemplate = (filename) => {
        router.push(getEditorPath(TEMPLATE_TAB_PREFIX + filename))
        closeDrawer()
    }

    const onToggleCollapseAll = () => {
        if (collapsedFolders.size > 0) {
            expandAll()
        } else {
            collapseAll(activeRepositoryTree.map((repository) => repository.id))
        }
    }

    const renderItem = ({ item }) => {
        if (item.type === 'note') {
            return (
                <DrawerNoteItem
                    note={item.note}
                    depth={item.depth}
                    active={item.note.id === currentId}
                    onPress={() => onOpenNote(item.note.id)}
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
    }

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
