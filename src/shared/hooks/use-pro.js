import { useContext } from 'react'

import { ProContext } from '@/shared/context/pro-context'

export const usePro = () => {
    return useContext(ProContext)
}
