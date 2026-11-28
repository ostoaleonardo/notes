import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

import { Intro } from '@/features/home/screens/home/intro'
import { NoteToolbarSheets } from '@/features/editor/native/screens/notes/note-toolbar-sheets'
import { HomeToolbar } from '@/features/home/screens/home/home-toolbar'
import { AppBar } from '@/shared/components/app-bar/app-bar'
import { DirectAccessCard } from '@/shared/components/direct-access-card'
import { BlurTarget, BlurTargetProvider } from '@/ui/blur/blur-target'

import { useBottomSheet } from '@/shared/hooks/use-bottom-sheet'
import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useDefaultNoteFolder } from '@/shared/hooks/use-default-note-folder'
import { useOpenDailyNote } from '@/shared/hooks/use-open-daily-note'
import { useNotes } from '@/shared/hooks/use-notes'
import { usePro } from '@/shared/hooks/use-pro'
import { useRecentNotes } from '@/shared/hooks/use-recent-notes'
import { useTemplates } from '@/shared/hooks/use-templates'
import { useUtils } from '@/shared/hooks/use-utils'
import { getRecentIds } from '@/shared/utils/recent-ids'
import { pushOnce } from '@/shared/utils/navigation'

import { ROUTES } from '@/shared/constants/routes'
import { APP_BAR_MODES } from '@/shared/constants/app-bar'
import { APP_NAME, APP_NAME_PRO_SUFFIX } from '@/shared/constants/app-name'

export const HomeScreen = () => {
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
            params: { folderId: defaultFolderId }
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
                <DirectAccessCard />
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
