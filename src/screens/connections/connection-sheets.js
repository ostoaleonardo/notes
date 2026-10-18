import { memo } from 'react'

import { CreateNoteDialog } from './create-note-dialog'
import { OriginSheet } from './origin-sheet'
import { RelationsSheet } from './relations-sheet'

export const ConnectionSheets = memo(function ConnectionSheets({
    session,
    entity,
    primary,
    onViewTree,
    onSelectOrigin
}) {
    const { model, getTitle, missingNote, relationsSheet, originSheet } = session

    return (
        <>
            <RelationsSheet
                sheet={relationsSheet}
                entity={entity}
                model={model}
                getTitle={getTitle}
                primary={primary}
                onViewTree={onViewTree}
            />

            <OriginSheet
                sheet={originSheet}
                model={model}
                getTitle={getTitle}
                onSelect={onSelectOrigin}
            />

            <CreateNoteDialog missingNote={missingNote} />
        </>
    )
})
