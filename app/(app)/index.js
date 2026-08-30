import { Redirect } from 'expo-router'
import { useCurrentNote, useNotes, useRepositories } from '@/hooks'
import { ROUTES } from '@/constants'
import { getEditorPath } from '@/utils'

export default function App() {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeRepository } = useRepositories()

    const isReady = !!activeRepository && !loading
    const destination = currentId ? getEditorPath(currentId) : ROUTES.HOME

    return <Redirect href={isReady ? destination : ROUTES.REPOSITORY_GATE} />
}
