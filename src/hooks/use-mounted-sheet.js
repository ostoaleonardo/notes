import { useCallback, useMemo, useState } from 'react'

export function useMountedSheet() {
    const [mounted, setMounted] = useState(false)

    const onOpen = useCallback(() => setMounted(true), [])
    const onClose = useCallback(() => setMounted(false), [])

    return useMemo(() => ({ mounted, onOpen, onClose }), [mounted, onOpen, onClose])
}
