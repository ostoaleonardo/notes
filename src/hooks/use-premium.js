import { useContext } from 'react'
import { PremiumContext } from '../context/premium-context'

export const usePremium = () => {
    return useContext(PremiumContext)
}
