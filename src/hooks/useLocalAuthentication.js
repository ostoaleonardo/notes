import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as LocalAuthentication from 'expo-local-authentication'

export function useLocalAuthentication() {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(true)
    const [hasBiometrics, setHasBiometrics] = useState(false)

    useEffect(() => {
        (async () => {
            const hasBiometrics = await LocalAuthentication.hasHardwareAsync()
            const isEnrolled = await LocalAuthentication.isEnrolledAsync()

            setHasBiometrics(hasBiometrics && isEnrolled)
            setIsLoading(false)
        })()
    }, [])

    const authenticate = async () => {
        if (!hasBiometrics) return

        const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: t('biometric.auth')
        })

        return success
    }

    return {
        isLoading,
        hasBiometrics,
        authenticate
    }
}
