import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [hasBiometrics, setHasBiometrics] = useState(false)

    return (
        <AuthContext.Provider
            value={{
                hasBiometrics,
                setHasBiometrics,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
