import { useCallback, useMemo, useState } from 'react'

export function usePagedRows(rows, pageSize) {
    const [state, setState] = useState({ rows, count: pageSize })

    const count = state.rows === rows ? state.count : pageSize

    const data = useMemo(() => rows.slice(0, count), [rows, count])

    const onEndReached = useCallback(() => {
        setState((current) => {
            const base = current.rows === rows ? current.count : pageSize

            if (base >= rows.length) return current

            return { rows, count: base + pageSize }
        })
    }, [rows, pageSize])

    return { data, total: rows.length, onEndReached }
}
