import { useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { AuthContext } from '@/context'

export function useLocalAuthentication() {
    const { hasBiometrics, setHasBiometrics } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(true)
    const appState = useRef(AppState.currentState)

    useEffect(() => {
        checkBiometrics()
    }, [])

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App has come to the foreground!')
                checkBiometrics()
            }

            appState.current = nextAppState
        })

        return () => {
            subscription.remove()
        }
    }, [])

    const checkBiometrics = async () => {
        const hasBiometrics = await LocalAuthentication.hasHardwareAsync()
        const isEnrolled = await LocalAuthentication.isEnrolledAsync()

        setHasBiometrics(hasBiometrics && isEnrolled)
        setIsLoading(false)
    }

    const authenticate = async (message) => {
        if (!hasBiometrics) return

        const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: message
        })

        return success
    }

    return {
        isLoading,
        hasBiometrics,
        authenticate
    }
}
