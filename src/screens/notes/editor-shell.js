import { MarkdownEditorLayout } from './markdown-editor-layout'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { MarkdownSearchBar } from './markdown-search-bar'
import { MarkdownInsertSheets } from './markdown-insert-sheets'
import { NoteToolbarSheets } from './note-toolbar-sheets'
import { AppBar } from '@/components/app-bar/app-bar'

import { APP_BAR_MODES } from '@/constants/app-bar'
import { EDITOR_MODES } from '@/constants/editor-modes'

export function EditorShell({
    mode,
    onSetMode,
    scope,
    chrome,
    actions,
    versionHistory,
    toggleProps,
    repositoryId,
    initialSearch,
    sheets,
    children
}) {
    return (
        <>
            <AppBar
                mode={APP_BAR_MODES.MENU}
                trailing={(
                    <MarkdownModeToggle
                        mode={mode}
                        scope={scope}
                        onSetMode={onSetMode}
                        search={chrome.search}
                        isFocused={chrome.isFocused}
                        onOpenVersionHistory={versionHistory.onOpen}
                        {...toggleProps}
                    />
                )}
            />

            <MarkdownSearchBar
                search={chrome.search}
                action={chrome.action}
                canReplace={mode !== EDITOR_MODES.READ}
            />

            <MarkdownEditorLayout
                mode={mode}
                scope={scope}
                actions={actions}
                canUndo={chrome.canUndo}
                canRedo={chrome.canRedo}
                isFocused={chrome.isFocused}
                onRunAction={chrome.onRunAction}
            >
                {children}
            </MarkdownEditorLayout>

            {sheets}

            <MarkdownInsertSheets
                action={chrome.action}
                linkSheet={chrome.linkSheet}
                tableSheet={chrome.tableSheet}
                imageSheet={chrome.imageSheet}
                repositoryId={repositoryId}
            />

            <NoteToolbarSheets
                recentsSheet={chrome.recentsSheet}
                searchSheet={chrome.searchSheet}
                initialSearch={initialSearch}
            />
        </>
    )
}
