import { Redirect } from 'expo-router'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { getEditorPath } from '@/utils/editor-path'

import { ROUTES } from '@/constants/routes'

export default function App() {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeRepository } = useRepositories()

    const isReady = !!activeRepository && !loading
    const destination = currentId ? getEditorPath(currentId) : ROUTES.HOME

    return <Redirect href={isReady ? destination : ROUTES.REPOSITORY_GATE} />
}
