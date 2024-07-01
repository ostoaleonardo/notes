import { useContext, useEffect } from 'react'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'

export function useAuth() {
    const {
        setUser,
        setAccessToken,
        isSignedIn,
        setIsSignedIn,
        setIsAuthenticating
    } = useContext(AuthContext)

    const signIn = async () => {
        setIsAuthenticating(true)

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
            setIsAuthenticating(false)
        }
    }

    const signOut = async () => {
        try {
            await GoogleSignin.signOut()
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
        try {
            const { user } = await GoogleSignin.getCurrentUser()
            return user
        } catch (error) {
            return null
        }
    }

    const getAccessToken = async () => {
        try {
            const { accessToken } = await GoogleSignin.getTokens()
            return accessToken
        } catch (error) {
            return null
        }
    }

    useEffect(() => {
        (async () => {
            if (!isSignedIn) return
            setIsAuthenticating(true)

            const currentUser = await getCurrentUser()
            setUser(currentUser)

            const accessToken = await getAccessToken()
            setAccessToken(accessToken)

            setIsAuthenticating(false)
        })()
    }, [])

    return {
        isSignedIn,
        setIsSignedIn,
        signIn,
        signOut,
        getIsSignedIn,
        getAccessToken,
        getCurrentUser
    }
}
