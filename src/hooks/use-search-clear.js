import { useCallback, useRef } from 'react'

export function useSearchClear(onChangeText) {
    const fieldRef = useRef(null)

    const onClear = useCallback(() => {
        fieldRef.current?.clear()
        onChangeText('')
    }, [onChangeText])

    return { fieldRef, onClear }
}
