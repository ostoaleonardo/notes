import { useCallback, useMemo, useRef } from 'react'

export function useBottomSheet() {
    const ref = useRef(null)
    const beforeOpen = useRef(null)

    const onOpen = useCallback(() => {
        if (!beforeOpen.current) {
            ref.current?.present()
            return
        }

        beforeOpen.current()
        setTimeout(() => ref.current?.present(), 0)
    }, [])
    const onClose = useCallback(() => ref.current?.close(), [])

    return useMemo(() => ({ ref, beforeOpen, onOpen, onClose }), [onOpen, onClose])
}
