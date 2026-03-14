import { createContext, useContext, useState } from 'react'

const PremiumContext = createContext()

export function PremiumProvider({ children }) {
    const [premium, setPremium] = useState(false)

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
