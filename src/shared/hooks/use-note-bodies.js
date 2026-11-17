import { useEffect, useState } from 'react'

import { noteBodies } from '@/shared/utils/note-body'

const NO_BODIES = new Map()

export const useNoteBodies = (notes, loader = noteBodies) => {
    const [bodies, setBodies] = useState(NO_BODIES)

    useEffect(() => {
        let cancelled = false

        loader.load(notes).then((loaded) => {
            if (!cancelled) setBodies(loaded)
        })

        return () => { cancelled = true }
    }, [notes, loader])

    return bodies
}
