import { useContext } from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'

export function useAuth() {
    const {
        user,
        setUser,
        accessToken,
        setAccessToken,
        isSignedIn,
        setIsSignedIn,
        setIsAuthenticating
    } = useContext(AuthContext)

    const signIn = async () => {
        try {
            setIsAuthenticating(true)

            await GoogleSignin.hasPlayServices()
            const result = await GoogleSignin.signIn()
            const user = result?.data?.user

            if (user) {
                const accessToken = await getAccessToken()
                setAccessToken(accessToken)
                setIsSignedIn(true)
                setUser(user)
            }
        } catch (error) {
            throw error
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
            throw error
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
            throw error
        }
    }

    const getIsSignedIn = async () => {
        try {
            return await GoogleSignin.isSignedIn()
        } catch (error) {
            return false
        }
    }

    const getCurrentUser = () => {
        try {
            const { user } = GoogleSignin.getCurrentUser()
            return user
        } catch (error) {
            return null
        }
    }

    const getAccessToken = async () => {
        try {
            const { accessToken } = await GoogleSignin.getTokens()
            setAccessToken(accessToken)
            return accessToken
        } catch (error) {
            throw error
        }
    }

    return {
        user,
        isSignedIn,
        setIsSignedIn,
        accessToken,
        getAccessToken,
        signIn,
        signOut,
        signInSilently,
        getIsSignedIn,
        getCurrentUser
    }
}
