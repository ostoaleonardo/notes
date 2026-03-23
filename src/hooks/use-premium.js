import { useContext } from 'react'
import { PremiumContext } from '@/context'

export const usePremium = () => {
    return useContext(PremiumContext)
}
