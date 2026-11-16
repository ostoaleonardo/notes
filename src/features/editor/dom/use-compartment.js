import { useEffect, useState } from 'react'
import { Compartment } from '@codemirror/state'

import { useMemoByDeps } from '@/hooks/use-memo-by-deps'

export const useCompartment = (viewRef, buildExtension, deps) => {
    const [compartment] = useState(() => new Compartment())

    const extension = useMemoByDeps(buildExtension, deps)

    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        view.dispatch({ effects: compartment.reconfigure(extension) })
    }, [compartment, viewRef, extension])

    const [initialExtension] = useState(() => compartment.of(extension))

    return initialExtension
}
