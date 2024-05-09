import { useContext, useEffect, useState } from 'react'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'

export function useAuth() {
    const { setUser, isSignedIn, setIsSignedIn } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)

    const signIn = async () => {
        setIsLoading(true)

        try {
            await GoogleSignin.hasPlayServices()
            const userInfo = await GoogleSignin.signIn()

            if (userInfo) {
                const accessToken = await getAccessToken()
                setUser({ ...userInfo.user, accessToken })
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
            setUser({})
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
        const currentUser = await GoogleSignin.getCurrentUser()
        return currentUser.user
    }

    const getAccessToken = async () => {
        const tokens = await GoogleSignin.getTokens()
        return tokens.accessToken
    }

    useEffect(() => {
        (async () => {
            const isSignedIn = await getIsSignedIn()
            setIsSignedIn(isSignedIn)

            if (isSignedIn) {
                const currentUser = await getCurrentUser()
                const accessToken = await getAccessToken()

                setUser({ ...currentUser, accessToken })
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
