import { Redirect } from 'expo-router'
import { useNotes, useRepositories, useTabs } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { loading } = useNotes()
    const { activeRepository } = useRepositories()
    const { activeTabId } = useTabs()

    const isReady = !!activeRepository && !loading
    const destination = activeTabId ? ROUTES.EDIT_NOTE + activeTabId : ROUTES.HOME

    return <Redirect href={isReady ? destination : ROUTES.REPOSITORY_GATE} />
}
