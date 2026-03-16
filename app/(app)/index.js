import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useLocalAuthentication } from '@/hooks'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'

export default function App() {
    useLocalAuthentication()
    const { signInSilently } = useAuth()

    useEffect(() => {
        const signIn = async () => {
            await signInSilently()
        }

        signIn()
    }, [])

    return <Redirect href={ROUTES.HOME} />
}
