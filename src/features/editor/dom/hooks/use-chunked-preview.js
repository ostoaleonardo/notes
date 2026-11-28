import { useCallback, useEffect, useMemo, useRef } from 'react'

import { embedPdfLinks } from './use-pdf-embeds'

import { BACKLINKS_CLASS } from '@/shared/constants/backlinks'
import { CHUNK_DELAY_MS } from '@/features/editor/dom/constants/read-chunks'

const NO_FLUSH = () => {}

const scheduleNext = (callback) => {
    const id = setTimeout(callback, CHUNK_DELAY_MS)

    return () => clearTimeout(id)
}

const replaceBacklinks = (container, backlinksHtml) => {
    container.querySelectorAll(`:scope > .${BACKLINKS_CLASS}`).forEach((node) => node.remove())

    if (backlinksHtml) container.insertAdjacentHTML('beforeend', backlinksHtml)
}

export const useChunkedPreview = ({ previewRef, reader, backlinksHtml, onComplete }) => {
    const flushRef = useRef(NO_FLUSH)
    const completedRef = useRef(false)
    const backlinksRef = useRef(backlinksHtml)
    const onCompleteRef = useRef(onComplete)

    backlinksRef.current = backlinksHtml
    onCompleteRef.current = onComplete

    const isChunked = !!reader && reader.count > 1
    const inlineBacklinks = isChunked ? '' : backlinksHtml || ''

    const firstHtml = useMemo(
        () => (reader && reader.count > 0 ? reader.render(0) + inlineBacklinks : ''),
        [reader, inlineBacklinks]
    )

    useEffect(() => {
        completedRef.current = false
        flushRef.current = NO_FLUSH

        const container = previewRef.current
        if (!container || !isChunked) return undefined

        let index = 1
        let cancelled = false
        let cancelSchedule = NO_FLUSH

        const appendNext = () => {
            const before = container.lastElementChild

            container.insertAdjacentHTML('beforeend', reader.render(index))
            index++

            const added = []
            for (let node = before ? before.nextElementSibling : container.firstElementChild; node; node = node.nextElementSibling) {
                added.push(node)
            }

            embedPdfLinks(added, () => cancelled)
        }

        const finish = () => {
            completedRef.current = true
            flushRef.current = NO_FLUSH
            replaceBacklinks(container, backlinksRef.current)
            onCompleteRef.current?.()
        }

        const step = () => {
            if (cancelled) return

            if (index >= reader.count) {
                finish()
                return
            }

            appendNext()
            cancelSchedule = scheduleNext(step)
        }

        flushRef.current = () => {
            cancelSchedule()

            while (index < reader.count && !cancelled) appendNext()

            if (!cancelled && !completedRef.current) finish()
        }

        cancelSchedule = scheduleNext(step)

        return () => {
            cancelled = true
            cancelSchedule()
            flushRef.current = NO_FLUSH
        }
    }, [previewRef, reader, firstHtml, isChunked])

    useEffect(() => {
        const container = previewRef.current

        if (container && isChunked && completedRef.current) replaceBacklinks(container, backlinksHtml)
    }, [previewRef, isChunked, backlinksHtml])

    const flushAll = useCallback(() => flushRef.current(), [])

    return { firstHtml, flushAll }
}
