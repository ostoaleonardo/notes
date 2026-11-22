import { useCallback, useEffect, useRef, useState } from 'react'

import { createMemorySource, createSearchCursor } from '@/shared/utils/search-cursor'
import { bootMark } from '@/shared/utils/boot-mark'
import { logError } from '@/shared/utils/log-error'
import { nativeSearch } from '@/shared/utils/native-search'
import { noteBodies } from '@/shared/utils/note-body'
import { SourceOverflowError, searchIndex } from '@/shared/utils/search-index'

import { BOOT_MARKS } from '@/shared/constants/boot-marks'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { SEARCH_PAGE_SIZE } from '@/shared/constants/search-index'

const NO_MATCHES = []
const IDLE = { matches: NO_MATCHES, done: true, scanning: false, settledAst: null }

const openSource = (query) => searchIndex.createSource(query) || createMemorySource(query.notes, query.sort)

export function useSearchResults({ enabled, ast, notes, notePaths, pinned, matchCase, sort }) {
    const [state, setState] = useState(IDLE)
    const sessionRef = useRef(null)

    const fill = useCallback(async (session, target) => {
        if (session.running || session.done) return

        session.running = true
        setState((current) => ({ ...current, scanning: true }))

        const publish = (batch) => {
            if (session.cancelled) return

            session.matches = [...session.matches, ...batch]
            setState({ matches: session.matches, done: false, scanning: true, settledAst: session.ast })
        }

        let failed = false

        try {
            const result = await session.cursor.next(target, publish)
            if (!result || session.cancelled) return

            session.done = result.done

            if (!session.reported) {
                session.reported = true
                bootMark(BOOT_MARKS.SEARCH_FIRST_PAGE, {
                    source: session.close ? 'native' : 'js',
                    matches: session.matches.length,
                    done: result.done,
                    ms: Date.now() - session.startedAt
                })
            }

            setState({ matches: session.matches, done: result.done, scanning: false, settledAst: session.ast })
        } catch (error) {
            if (session.cancelled) return

            if (!(error instanceof SourceOverflowError)) logError(LOG_MESSAGES.ERROR_SEARCHING_INDEX, error)
            failed = true
        } finally {
            session.running = false
        }

        if (!failed) return

        if (session.fallback) {
            setState({ matches: session.matches, done: true, scanning: false, settledAst: session.ast })
            return
        }

        session.restart()
    }, [])

    useEffect(() => {
        if (!enabled) {
            sessionRef.current = null
            setState(IDLE)
            return undefined
        }

        const query = { ast, notes, notePaths, sort }
        const context = { pinned, notePaths, matchCase }

        const session = {
            ast,
            cancelled: false,
            running: false,
            done: false,
            matches: NO_MATCHES,
            cursor: null,
            close: null,
            reported: false,
            startedAt: Date.now(),
            fallback: false,
            restart: null
        }

        const start = (source) => {
            session.cursor = createSearchCursor({
                source,
                ast,
                context,
                isCancelled: () => session.cancelled,
                loadBodies: noteBodies.load
            })
            session.matches = NO_MATCHES
            session.done = false
        }

        session.restart = () => {
            session.fallback = true
            session.close?.()
            session.close = null
            start(createMemorySource(notes, sort))
            setState({ matches: NO_MATCHES, done: false, scanning: false, settledAst: null })
            fill(session, SEARCH_PAGE_SIZE)
        }

        const beginNative = async () => {
            try {
                const cursor = await nativeSearch.open({
                    ast,
                    notes,
                    notePaths,
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
                    start(openSource(query))
                } else {
                    session.cursor = cursor
                    session.close = cursor.close
                    session.matches = NO_MATCHES
                    session.done = false
                }
            } catch (error) {
                if (session.cancelled) return

                logError(LOG_MESSAGES.ERROR_SEARCHING_INDEX, error)
                start(openSource(query))
            }

            fill(session, SEARCH_PAGE_SIZE)
        }

        sessionRef.current = session

        if (nativeSearch.isEligible(notes)) {
            beginNative()
        } else {
            start(openSource(query))
            fill(session, SEARCH_PAGE_SIZE)
        }

        return () => {
            session.cancelled = true
            session.close?.()
        }
    }, [enabled, ast, notes, notePaths, pinned, matchCase, sort, fill])

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
