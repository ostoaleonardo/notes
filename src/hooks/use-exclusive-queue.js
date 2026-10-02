import { useRef } from 'react'

export const useExclusiveQueue = () => {
    const queueRef = useRef(Promise.resolve())

    const runExclusive = (fn) => {
        const result = queueRef.current.then(fn, fn)
        queueRef.current = result.catch(() => { })
        return result
    }

    return { runExclusive }
}
