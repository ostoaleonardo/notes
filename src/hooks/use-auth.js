import { t } from 'i18next'
import { useContext, useEffect } from 'react'
import { ToastAndroid } from 'react-native'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'

export function useAuth() {
    const {
        user,
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
            const { data, type } = await GoogleSignin.signIn()
            const { user } = data

            if (user) {
                const accessToken = await getAccessToken()
                setUser(user)
                setAccessToken(accessToken)
                setIsSignedIn(true)
            }

            return null
        } catch (error) {
            switch (error.code) {
                case statusCodes.IN_PROGRESS:
                    break
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    ToastAndroid.show(
                        t('play.services.available'),
                        ToastAndroid.SHORT
                    )
                    break
                default:
                    break
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

    const signInSilently = async () => {
        try {
            const { data, type } = await GoogleSignin.signInSilently()

            if (type === 'success') {
                setUser(data.user)
                setIsSignedIn(true)
            }
        } catch (error) {
            // handle errror
        }
    }

    const getIsSignedIn = async () => {
        try {
            return await GoogleSignin.isSignedIn()
        } catch (error) {
            return false
        }
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

            const accessToken = await getAccessToken()
            setAccessToken(accessToken)
        })()
    }, [])

    return {
        user,
        isSignedIn,
        setIsSignedIn,
        signIn,
        signOut,
        signInSilently,
        getIsSignedIn,
        getAccessToken,
        getCurrentUser
    }
}
