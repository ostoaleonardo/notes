import { useEffect, useMemo, useState } from 'react'
import { Compartment } from '@codemirror/state'

export const useCompartment = (viewRef, buildExtension, deps) => {
    const [compartment] = useState(() => new Compartment())
     
    const extension = useMemo(buildExtension, deps)

    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        view.dispatch({ effects: compartment.reconfigure(extension) })
    }, [extension])

    return useMemo(() => compartment.of(extension), [])
}
