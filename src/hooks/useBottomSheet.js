import { useRef } from 'react'

export function useBottomSheet() {
    const bottomSheetRef = useRef(null)

    const onOpen = () => bottomSheetRef.current.snapToIndex(0)
    const onClose = () => bottomSheetRef.current.close()

    return {
        onOpen,
        onClose,
        bottomSheetRef
    }
}
