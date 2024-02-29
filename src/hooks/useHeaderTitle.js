import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export function useHeaderTitle(title) {
    const router = useRouter()

    useEffect(() => {
        router.setParams({ title })
    }, [title])
}