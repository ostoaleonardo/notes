import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuth, useLocalAuthentication } from '@/hooks'
import { ROUTES } from '@/constants'


export default function App() {
    const [isReady, setIsReady] = useState(false)
    const { isSignedIn, setIsSignedIn, getIsSignedIn } = useAuth()

    useLocalAuthentication()

    useEffect(() => {
        (async () => {
            const isSignedIn = await getIsSignedIn()
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
