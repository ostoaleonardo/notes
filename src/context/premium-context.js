import { createContext, useEffect, useMemo, useState } from 'react'

export const PremiumContext = createContext()
const IS_DEV = process.env.NODE_ENV === 'development'

export function PremiumProvider({ isPremium = false, children }) {
    const [premium, setPremium] = useState(false)

    useEffect(() => {
        setPremium(isPremium || IS_DEV)
    }, [isPremium])

    const value = useMemo(() => ({ premium, setPremium }), [premium])

    return (
        <PremiumContext.Provider value={value}>
            {children}
        </PremiumContext.Provider>
    )
}
