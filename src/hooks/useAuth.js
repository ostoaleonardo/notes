import { useContext, useEffect } from 'react'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { AuthContext } from '@/context'

export function useAuth() {
    const { user, setUser, isSignedIn, setIsSignedIn } = useContext(AuthContext)

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices()
            const userInfo = await GoogleSignin.signIn()
            setUser(userInfo.user)
            setIsSignedIn(true)
        } catch (error) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    console.log('User cancelled the login flow')
                    break
                case statusCodes.IN_PROGRESS:
                    console.log('Operation (e.g. sign in) is in progress already')
                    break
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.log('Play services not available or outdated')
                    break
                default:
                    console.log('Some other error happened')
            }
        }
    }

    const signOut = async () => {
        try {
            await GoogleSignin.signOut()
            setUser({})
            setIsSignedIn(false)
        } catch (error) {
            console.error(error)
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
            if (user.accessToken) return

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
        user,
        signIn,
        signOut,
        isSignedIn,
        getCurrentUser
    }
}
