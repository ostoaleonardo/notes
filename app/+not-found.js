import { useEffect } from 'react'
import { useRouter } from 'expo-router'

import { ROUTES } from '@/shared/constants/routes'
import { NOT_FOUND_REDIRECT_DELAY } from '@/shared/constants/default-values'

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace(ROUTES.HOME)
        }, NOT_FOUND_REDIRECT_DELAY)

        return () => clearTimeout(timer)
    }, [router])

    return null
}
