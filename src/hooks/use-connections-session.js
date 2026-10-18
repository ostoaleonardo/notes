import { useCallback, useMemo } from 'react'
import { router } from 'expo-router'

import { useBottomSheet } from './use-bottom-sheet'
import { useConnectionLabels } from './use-connection-labels'
import { useConnectionModel } from './use-connection-model'
import { useMissingNote } from './use-missing-note'
import { useOpenFile } from './use-open-file'
import { summarizeConnections } from '@/utils/connection-model'
import { getEditorPath } from '@/utils/editor-path'

import { CONNECTION_TYPES, PENDING_TABS, PENDING_TAB_PARAM } from '@/constants/connections'
import { ROUTES } from '@/constants/routes'

export function useConnectionsSession() {
    const model = useConnectionModel()
    const getTitle = useConnectionLabels(model)
    const openFile = useOpenFile()
    const missingNote = useMissingNote()
    const { setMissing } = missingNote
    const relationsSheet = useBottomSheet()
    const originSheet = useBottomSheet()

    const summary = useMemo(() => summarizeConnections(model), [model])

    const onOpenEntity = useCallback((entity) => {
        relationsSheet.onClose()

        if (entity.type === CONNECTION_TYPES.NOTE) router.push(getEditorPath(entity.id))
        else openFile(model.fileById.get(entity.id))
    }, [relationsSheet, openFile, model])

    const onCreate = useCallback((entity) => {
        relationsSheet.onClose()
        setMissing({ title: getTitle(entity), path: '' })
    }, [relationsSheet, setMissing, getTitle])

    const onOpenPending = useCallback(() => {
        router.push({
            pathname: ROUTES.CONNECTIONS_PENDING,
            params: { [PENDING_TAB_PARAM]: PENDING_TABS.ORPHANS }
        })
    }, [])

    return useMemo(() => ({
        model,
        getTitle,
        summary,
        missingNote,
        relationsSheet,
        originSheet,
        onOpenEntity,
        onCreate,
        onOpenPending
    }), [
        model,
        getTitle,
        summary,
        missingNote,
        relationsSheet,
        originSheet,
        onOpenEntity,
        onCreate,
        onOpenPending
    ])
}
