import { useEffect } from 'react'
import { useRouter } from 'expo-router'

import { ROUTES } from '@/constants/routes'
import { NOT_FOUND_REDIRECT_DELAY } from '@/constants/default-values'

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace(ROUTES.HOME)
        }, NOT_FOUND_REDIRECT_DELAY)

        return () => clearTimeout(timer)
    }, [])

    return null
}
