import { useContext, useEffect, useState } from 'react'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'
import { useStorage } from './useStorage'

export function useAuth() {
    const { setUser, setAccessToken, isSignedIn, setIsSignedIn } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)
    const { clear } = useStorage()

    const signIn = async () => {
        setIsLoading(true)

        try {
            await GoogleSignin.hasPlayServices()
            const { user } = await GoogleSignin.signIn()

            if (user) {
                const accessToken = await getAccessToken()
                setUser(user)
                setAccessToken(accessToken)
                setIsSignedIn(true)

                return accessToken
            }

            return null
        } catch (error) {
            switch (error.code) {
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    // Handle error
                    break
                default:
                    return null
            }
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        try {
            await GoogleSignin.signOut()
            await clear()
            setUser({})
            setAccessToken('')
            setIsSignedIn(false)
        } catch (error) {
            // Handle error
        }
    }

    const getIsSignedIn = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn()
        return isSignedIn
    }

    const getCurrentUser = async () => {
        const { user } = await GoogleSignin.getCurrentUser()
        return user
    }

    const getAccessToken = async () => {
        const { accessToken } = await GoogleSignin.getTokens()
        return accessToken
    }

    useEffect(() => {
        (async () => {
            const isSignedIn = await getIsSignedIn()
            setIsSignedIn(isSignedIn)

            if (isSignedIn) {
                const currentUser = await getCurrentUser()
                const accessToken = await getAccessToken()

                setUser(currentUser)
                setAccessToken(accessToken)
            }
        })()
    }, [])

    return {
        signIn,
        signOut,
        isLoading,
        isSignedIn,
        setIsSignedIn,
        getIsSignedIn,
        getCurrentUser
    }
}
