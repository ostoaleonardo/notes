import { router } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { DrawerContentScrollView } from 'expo-router/drawer'
import { InteractionManager, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DrawerHeader } from './drawer-header'
import { DrawerScreen } from './drawer-screen'
import { DrawerRepositoryItem } from './drawer-repository-item'
import { DrawerTemplatesSection } from './drawer-templates-section'
import { Separator } from '../separator'
import { AddSubfolder } from '@/screens/modals/add-subfolder'
import { AddTemplate } from '@/screens/modals/add-template'
import { DeleteRepository } from '@/screens/modals/delete-repository'
import { RenameRepository } from '@/screens/modals/rename-repository'
import { ROUTES, TEMPLATE_TAB_PREFIX, TEMPLATES_SECTION_ID } from '@/constants'
import { useCurrentNote, useNotes, useRepositories, useTags, useTemplates, useUtils } from '@/hooks'
import { buildRepositoryTree, getEditorPath } from '@/utils'

export function DrawerItems({ navigation }) {
    const { t } = useTranslation()
    const { tags } = useTags()
    const { notes } = useNotes()
    const { listTemplates } = useTemplates()
    const { currentId } = useCurrentNote()

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

    return (
        <DrawerContentScrollView>
            <View>
                <DrawerHeader
                    collapsed={collapsedFolders.size > 0}
                    onToggleCollapseAll={onToggleCollapseAll}
                />

                {tree.map((node) => (
                    <DrawerRepositoryItem
                        key={node.repository.id}
                        {...node}
                        depth={0}
                        active={node.repository.id === activeRepositoryId}
                        activeNoteId={currentId}
                        onOpenRoot={onOpenRoot}
                        onOpenNote={onOpenNote}
                        onAddSubfolder={(id = node.repository.id) => setSubfolderParentId(id)}
                        onCreateNote={onCreateNote}
                        onEditFolder={(id = node.repository.id) => setEditFolderId(id)}
                        onDelete={(id = node.repository.id) => setDeleteId(id)}
                    />
                ))}

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
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    separator: {
        marginVertical: 12
    }
})
