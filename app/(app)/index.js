import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useAuth, useLocalAuthentication } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    useLocalAuthentication()

    const {
        signInSilently,
        getAccessToken
    } = useAuth()

    useEffect(() => {
        const signIn = async () => {
            try {
                await signInSilently()
                await getAccessToken()
            } catch (error) {
                console.error('Error during silent sign-in:', error)
            }
        }

        signIn()
    }, [])

    return <Redirect href={ROUTES.HOME} />
}
