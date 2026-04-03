import { useCallback, useEffect, useState } from 'react'
import { useLocalAuthentication } from './use-local-authentication'
import { useHaptics } from './use-haptics'
import { getEncryptedPassword } from '@/utils'
import { FEEDBACK_TYPES } from '@/constants'

export function useNoteAuthentication(id, password) {
    const { vibrate } = useHaptics()
    const { hasBiometrics, authenticate } = useLocalAuthentication()

    const [passwordValue, setPasswordValue] = useState('')
    const [authenticated, setAuthenticated] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setPasswordValue('')
        setMessage('')
        setAuthenticated(false)
    }, [id])

    const resetError = useCallback(() => setMessage(''), [])

    const verifyPassword = useCallback(async () => {
        if (!passwordValue) return
        setMessage('')

        const digest = await getEncryptedPassword(passwordValue)

        if (digest === password) {
            vibrate(FEEDBACK_TYPES.SUCCESS)
            setAuthenticated(true)
        } else {
            setMessage('message.password.wrong')
            vibrate(FEEDBACK_TYPES.ERROR)
        }
    }, [passwordValue, password, vibrate])

    const authBiometrics = useCallback(async (prompt) => {
        const success = await authenticate(prompt)

        if (success) {
            vibrate(FEEDBACK_TYPES.SUCCESS)
            setAuthenticated(true)
        }
    }, [authenticate, vibrate])

    return {
        hasBiometrics,
        authenticated,
        passwordValue,
        setPasswordValue,
        verifyPassword,
        authBiometrics,
        resetError,
        message
    }
}
