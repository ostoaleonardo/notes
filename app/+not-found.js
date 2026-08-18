import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { ROUTES } from '@/constants'

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace(ROUTES.HOME)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return null
}
