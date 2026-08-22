import { Redirect } from 'expo-router'
import { useLocalAuthentication, useNotes, useRepositories } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    useLocalAuthentication()
    const { loading } = useNotes()
    const { activeRepository } = useRepositories()

    const isReady = !!activeRepository && !loading

    return <Redirect href={isReady ? ROUTES.HOME : ROUTES.REPOSITORY_GATE} />
}
