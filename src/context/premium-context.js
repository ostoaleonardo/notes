import { createContext, useEffect, useState } from 'react'

export const PremiumContext = createContext()
const IS_DEV = process.env.NODE_ENV === 'development'

export function PremiumProvider({ isPremium = false, children }) {
    const [premium, setPremium] = useState(false)

    useEffect(() => {
        setPremium(isPremium || IS_DEV)
    }, [isPremium])

    return (
        <PremiumContext.Provider
            value={{
                premium,
                setPremium
            }}
        >
            {children}
        </PremiumContext.Provider>
    )
}
