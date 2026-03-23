import { createContext, useEffect, useState } from 'react'

export const PremiumContext = createContext()

export function PremiumProvider({ isPremium = false, children }) {
    const [premium, setPremium] = useState(false)

    useEffect(() => {
        setPremium(isPremium)
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
