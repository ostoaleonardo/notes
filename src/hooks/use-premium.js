import { createContext, useContext, useEffect, useState } from 'react'

const PremiumContext = createContext()

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

export const usePremium = () => {
    const {
        premium,
        setPremium
    } = useContext(PremiumContext)

    return {
        premium,
        setPremium
    }
}
