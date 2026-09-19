import { memo } from 'react'

import { VersionHistoryContent } from './version-history-content'

export const VersionHistoryPanelContent = memo(function VersionHistoryPanelContent({
    directoryUri,
    noteId,
    currentContent,
    pro,
    onRestore,
    onClose
}) {
    const onRestoreVersion = (version) => {
        onRestore(version)
        onClose()
    }

    return (
        <VersionHistoryContent
            directoryUri={directoryUri}
            noteId={noteId}
            currentContent={currentContent}
            pro={pro}
            onRestore={onRestoreVersion}
            onClose={onClose}
        />
    )
})
