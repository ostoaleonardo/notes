import { useContext } from 'react'

import { ProContext } from '../context/pro-context'

export const usePro = () => {
    return useContext(ProContext)
}
