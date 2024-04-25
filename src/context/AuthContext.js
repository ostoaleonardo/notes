import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState({})
    const [isSignedIn, setIsSignedIn] = useState(false)

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isSignedIn,
                setIsSignedIn
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
