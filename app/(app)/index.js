import { Redirect } from 'expo-router'
import { useLocalAuthentication, useRepositories } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    useLocalAuthentication()
    const { activeRepository } = useRepositories()

    return <Redirect href={activeRepository ? ROUTES.HOME : ROUTES.REPOSITORY_GATE} />
}
