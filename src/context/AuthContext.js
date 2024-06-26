import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState({})
    const [accessToken, setAccessToken] = useState('')
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [hasBiometrics, setHasBiometrics] = useState(false)
    const [isAuthenticating, setIsAuthenticating] = useState(false)

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                accessToken,
                setAccessToken,
                isSignedIn,
                setIsSignedIn,
                hasBiometrics,
                setHasBiometrics,
                isAuthenticating,
                setIsAuthenticating
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
