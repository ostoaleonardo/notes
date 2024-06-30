import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuth, useLocalAuthentication, useUser } from '@/hooks'
import { ROUTES } from '@/constants'

export default function App() {
    const { setUser } = useUser()
    const { isSignedIn, setIsSignedIn, getIsSignedIn, getCurrentUser } = useAuth()
    const [isReady, setIsReady] = useState(false)

    useLocalAuthentication()

    useEffect(() => {
        (async () => {
            const isSignedIn = await getIsSignedIn()

            if (isSignedIn) {
                const currentUser = await getCurrentUser()
                setUser(currentUser)
            }

            setIsSignedIn(isSignedIn)
            setIsReady(true)
        })()
    }, [])

    if (!isReady) return null

    if (!isSignedIn) {
        return <Redirect href={ROUTES.SIGN_IN} />
    }

    return <Redirect href={ROUTES.HOME} />
}
