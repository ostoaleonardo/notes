import { useContext } from 'react'
import { AuthContext } from '@/context'

export function useUser() {
    const { user, setUser } = useContext(AuthContext)
    
    return { user, setUser }
}
