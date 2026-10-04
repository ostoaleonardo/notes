import { useRef } from 'react'

const sameDeps = (a, b) => a.length === b.length && a.every((item, index) => Object.is(item, b[index]))

export const useMemoByDeps = (factory, deps) => {
    const ref = useRef(null)

    if (!ref.current || !sameDeps(ref.current.deps, deps)) {
        ref.current = { deps, value: factory() }
    }

    return ref.current.value
}
