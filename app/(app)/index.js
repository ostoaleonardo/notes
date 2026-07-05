import { Redirect } from 'expo-router'
import { useLocalAuthentication } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    useLocalAuthentication()

    return <Redirect href={ROUTES.HOME} />
}
