import { useCallback, useEffect, useRef, useState } from 'react'

import { bootMark } from '@/shared/utils/boot-mark'
import { logError } from '@/shared/utils/log-error'
import { nativeSearch } from '@/shared/utils/native-search'

import { BOOT_MARKS } from '@/shared/constants/boot-marks'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { SEARCH_PAGE_SIZE } from '@/shared/constants/search-index'

const NO_MATCHES = []
const IDLE = { matches: NO_MATCHES, done: true, scanning: false, settledAst: null }

export function useSearchResults({
    enabled,
    ast,
    notes,
    folderPathByNote,
    pinned,
    matchCase,
    sort
}) {
    const [state, setState] = useState(IDLE)
    const sessionRef = useRef(null)

    const finish = useCallback((session) => {
        session.done = true
        setState({ matches: session.matches, done: true, scanning: false, settledAst: session.ast })
    }, [])

    const fill = useCallback(async (session, target) => {
        if (session.running || session.done || !session.cursor) return

        session.running = true
        setState((current) => ({ ...current, scanning: true }))

        const publish = (batch) => {
            if (session.cancelled) return

            session.matches = [...session.matches, ...batch]
            setState({ matches: session.matches, done: false, scanning: true, settledAst: session.ast })
        }

        try {
            const result = await session.cursor.next(target, publish)
            if (!result || session.cancelled) return

            session.done = result.done

            if (!session.reported) {
                session.reported = true
                bootMark(BOOT_MARKS.SEARCH_FIRST_PAGE, {
                    matches: session.matches.length,
                    done: result.done,
                    ms: Date.now() - session.startedAt
                })
            }

            setState({
                matches: session.matches,
                done: result.done,
                scanning: false,
                settledAst: session.ast
            })
        } catch (error) {
            if (session.cancelled) return

            logError(LOG_MESSAGES.ERROR_SEARCHING_INDEX, error)
            finish(session)
        } finally {
            session.running = false
        }
    }, [finish])

    useEffect(() => {
        if (!enabled) {
            sessionRef.current = null
            setState(IDLE)
            return undefined
        }

        const session = {
            ast,
            cancelled: false,
            running: false,
            done: false,
            matches: NO_MATCHES,
            cursor: null,
            reported: false,
            startedAt: Date.now()
        }

        const begin = async () => {
            try {
                const cursor = await nativeSearch.open({
                    ast,
                    notes,
                    folderPathByNote,
                    pinned,
                    matchCase,
                    sort,
                    isCancelled: () => session.cancelled
                })

                if (session.cancelled) {
                    cursor?.close()
                    return
                }

                if (!cursor) {
                    finish(session)
                    return
                }

                session.cursor = cursor
            } catch (error) {
                if (session.cancelled) return

                logError(LOG_MESSAGES.ERROR_SEARCHING_INDEX, error)
                finish(session)
                return
            }

            fill(session, SEARCH_PAGE_SIZE)
        }

        sessionRef.current = session
        begin()

        return () => {
            session.cancelled = true
            session.cursor?.close()
        }
    }, [enabled, ast, notes, folderPathByNote, pinned, matchCase, sort, fill, finish])

    const loadMore = useCallback(() => {
        const session = sessionRef.current
        if (session) fill(session, SEARCH_PAGE_SIZE)
    }, [fill])

    const loading = enabled && state.settledAst !== ast

    return {
        results: loading ? NO_MATCHES : state.matches,
        done: state.done,
        scanning: state.scanning,
        loading,
        loadMore
    }
}
