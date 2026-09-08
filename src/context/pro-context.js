import { isDevice } from 'expo-device'
import { createContext, useEffect, useMemo, useState } from 'react'

export const ProContext = createContext()

export function ProProvider({ isPro = false, children }) {
    const [pro, setPro] = useState(false)

    useEffect(() => {
        setPro(isPro || !isDevice)
    }, [isPro])

    const value = useMemo(() => ({
        pro, setPro
    }), [pro])

    return (
        <ProContext.Provider value={value}>
            {children}
        </ProContext.Provider>
    )
}
