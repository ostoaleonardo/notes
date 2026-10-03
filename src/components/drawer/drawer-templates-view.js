import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddTemplate } from '@/screens/dialogs/add-template'
import { AddTemplateFolder } from '@/screens/dialogs/add-template-folder'
import { DrawerToolbar, DrawerToolbarButton } from './drawer-toolbar'
import { DrawerList } from './drawer-list'
import { DrawerNoteItem } from './drawer-note-item'
import { DrawerTemplateFolderItem } from './drawer-template-folder-item'
import { openEditor } from './drawer-open-editor'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useUtils } from '@/hooks/use-utils'
import { flattenTemplateTree } from '@/utils/template-path'

import { CreateNewFolder } from '@/icons/create-new-folder'
import { Plus } from '@/icons/plus'
import { CollapseAll } from '@/icons/collapse-all'
import { ExpandAll } from '@/icons/expand-all'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'
import { TEMPLATE_FOLDER_KEY_PREFIX, TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export function DrawerTemplatesView({ closeDrawer }) {
    const { t } = useTranslation()
    const { currentId } = useCurrentNote()
    const { collapsedFolders, setFoldersCollapsed } = useUtils()
    const { activeRepository } = useRepositories()
    const { templates, folders, refresh } = useTemplatesList([activeRepository?.id])
    const [addTemplateFolderPath, setAddTemplateFolderPath] = useState(null)
    const [addSubfolderParent, setAddSubfolderParent] = useState(null)

    const rows = useMemo(
        () => flattenTemplateTree(templates, folders, collapsedFolders),
        [templates, folders, collapsedFolders]
    )

    const activeFilename = currentId.startsWith(TEMPLATE_TAB_PREFIX)
        ? currentId.slice(TEMPLATE_TAB_PREFIX.length)
        : ''

    const onOpenTemplate = useCallback((filename) => {
        openEditor(TEMPLATE_TAB_PREFIX + filename, currentId)
        closeDrawer()
    }, [closeDrawer, currentId])

    const onDismissAddTemplate = useCallback(() => {
        setAddTemplateFolderPath(null)
        refresh()
        closeDrawer()
    }, [refresh, closeDrawer])

    const onDismissAddSubfolder = useCallback(() => {
        setAddSubfolderParent(null)
        refresh()
    }, [refresh])

    const onFolderAction = useCallback((action, path) => {
        if (action === REPOSITORY_ACTIONS.CREATE_NOTE) setAddTemplateFolderPath(path)
        if (action === REPOSITORY_ACTIONS.ADD_SUBFOLDER) setAddSubfolderParent(path)
    }, [])

    const folderIds = useMemo(
        () => folders.map((path) => TEMPLATE_FOLDER_KEY_PREFIX + path),
        [folders]
    )

    const anyCollapsed = folderIds.some((id) => collapsedFolders.has(id))

    const onToggleCollapseAll = useCallback(() => {
        setFoldersCollapsed(folderIds, !anyCollapsed)
    }, [setFoldersCollapsed, folderIds, anyCollapsed])

    const toolbarItems = useMemo(() => [
        {
            key: 'new-template',
            icon: Plus,
            onPress: () => setAddTemplateFolderPath(''),
            accessibilityLabel: t('templates.new')
        },
        {
            key: 'add-subfolder',
            icon: CreateNewFolder,
            onPress: () => setAddSubfolderParent(''),
            accessibilityLabel: t('repositories.add_subfolder')
        },
        {
            key: 'toggle-all',
            icon: anyCollapsed ? ExpandAll : CollapseAll,
            onPress: onToggleCollapseAll,
            accessibilityLabel: t(anyCollapsed ? 'drawer.expand_all' : 'drawer.collapse_all')
        }
    ], [t, anyCollapsed, onToggleCollapseAll])

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'folder') {
            return (
                <DrawerTemplateFolderItem
                    folder={item}
                    onAction={onFolderAction}
                />
            )
        }

        return (
            <DrawerNoteItem
                depth={item.depth}
                note={{
                    path: item.template.filename,
                    title: t(`templates.${item.template.name}`, item.template.name)
                }}
                active={item.template.filename === activeFilename}
                onOpenNote={onOpenTemplate}
            />
        )
    }, [t, activeFilename, onOpenTemplate, onFolderAction])

    return (
        <>
            <DrawerList
                data={rows}
                keyExtractor={(row) => row.id}
                renderItem={renderItem}
            />

            <DrawerToolbar>
                {toolbarItems.map(({ key, ...item }) => (
                    <DrawerToolbarButton
                        key={key}
                        {...item}
                    />
                ))}
            </DrawerToolbar>

            <AddTemplate
                visible={addTemplateFolderPath !== null}
                folder={addTemplateFolderPath || ''}
                onDismiss={onDismissAddTemplate}
            />
            <AddTemplateFolder
                visible={addSubfolderParent !== null}
                parent={addSubfolderParent || ''}
                onDismiss={onDismissAddSubfolder}
            />
        </>
    )
}
