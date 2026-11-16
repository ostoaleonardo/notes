import { useRef } from 'react'

export const useLatestRef = (value) => {
    const ref = useRef(value)
    ref.current = value
    return ref
}
