import { useCallback, useRef } from 'react'

export const useStableCallback = (callback) => {
    const ref = useRef(callback)
    ref.current = callback

    return useCallback((...args) => ref.current?.(...args), [])
}
