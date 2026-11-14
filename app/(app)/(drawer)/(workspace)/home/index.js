import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

import { Intro } from '@/screens/notes/intro'
import { NoteToolbarSheets } from '@/screens/notes/note-toolbar-sheets'
import { HomeToolbar } from '@/screens/notes/home-toolbar'
import { AppBar } from '@/components/app-bar/app-bar'
import { BlurTarget, BlurTargetProvider } from '@/ui/blur/blur-target'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useCurrentNote } from '@/hooks/use-current-note'
import { useDefaultNoteFolder } from '@/hooks/use-default-note-folder'
import { useOpenDailyNote } from '@/hooks/use-open-daily-note'
import { useNotes } from '@/hooks/use-notes'
import { usePro } from '@/hooks/use-pro'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useTemplates } from '@/hooks/use-templates'
import { useUtils } from '@/hooks/use-utils'
import { getRecentIds } from '@/utils/recent-ids'
import { pushOnce } from '@/utils/navigation'

import { ROUTES } from '@/constants/routes'
import { APP_BAR_MODES } from '@/constants/app-bar'
import { APP_NAME, APP_NAME_PRO_SUFFIX } from '@/constants/app-name'

export default function Home() {
    const { notes } = useNotes()
    const { pinned } = useUtils()
    const { pro } = usePro()
    const { recent } = useRecentNotes()
    const { listTemplates } = useTemplates()
    const { registerCurrent } = useCurrentNote()

    const [templates, setTemplates] = useState([])
    const defaultFolderId = useDefaultNoteFolder()

    const recentCount = useMemo(
        () => getRecentIds(pinned, recent, notes, templates).length,
        [pinned, recent, notes, templates]
    )

    const recentsSheet = useBottomSheet()
    const searchSheet = useBottomSheet()

    useFocusEffect(
        useCallback(() => {
            registerCurrent('')
        }, [registerCurrent])
    )

    const loadTemplates = useEffectEvent(() => {
        listTemplates({ withContent: false }).then(setTemplates)
    })

    useEffect(() => {
        loadTemplates()
    }, [])

    const onCreateNote = () => {
        pushOnce({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId: defaultFolderId }
        })
    }

    const [onOpenDailyNote] = useOpenDailyNote()

    return (
        <BlurTargetProvider style={{ flex: 1 }}>
            <AppBar
                mode={APP_BAR_MODES.MENU}
                title={APP_NAME + (pro ? APP_NAME_PRO_SUFFIX : '')}
            />

            <BlurTarget style={{ flex: 1 }}>
                <Intro />
            </BlurTarget>

            <HomeToolbar
                onCreateNote={onCreateNote}
                onOpenDailyNote={onOpenDailyNote}
                onOpenRecents={recentsSheet.onOpen}
                onOpenSearch={searchSheet.onOpen}
                recentCount={recentCount}
            />

            <NoteToolbarSheets
                home={true}
                recentsSheet={recentsSheet}
                searchSheet={searchSheet}
            />
        </BlurTargetProvider>
    )
}
