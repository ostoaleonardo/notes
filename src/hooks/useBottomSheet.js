import { useRef } from 'react'

export function useBottomSheet() {
    const ref = useRef(null)

    const onOpen = () => ref.current.snapToIndex(0)
    const onClose = () => ref.current.close()

    return {
        ref,
        onOpen,
        onClose
    }
}
