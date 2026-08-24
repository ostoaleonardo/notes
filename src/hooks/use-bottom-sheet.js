import { useCallback, useRef } from 'react'

export function useBottomSheet() {
    const ref = useRef(null)

    const onOpen = useCallback(() => ref.current?.present(), [])
    const onClose = useCallback(() => ref.current?.close(), [])

    return { ref, onOpen, onClose }
}
