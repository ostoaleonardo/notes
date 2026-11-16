import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'

import { useChunkedPreview } from '../use-chunked-preview'

const buildReader = (count) => ({
    count,
    render: jest.fn((index) => `<p data-chunk="${index}">chunk ${index}</p>`)
})

const Harness = ({ reader, backlinksHtml, onComplete, onFlush }) => {
    const previewRef = React.useRef(null)
    const { firstHtml, flushAll } = useChunkedPreview({ previewRef, reader, backlinksHtml, onComplete })

    onFlush.current = flushAll

    return <div ref={previewRef} dangerouslySetInnerHTML={{ __html: firstHtml }} />
}

const mount = async (props) => {
    const host = document.createElement('div')
    const flush = { current: null }
    const root = createRoot(host)

    await act(async () => {
        root.render(<Harness onFlush={flush} {...props} />)
    })

    return { host, flush, root, container: () => host.firstElementChild }
}

const chunkIds = (container) => [...container.querySelectorAll('[data-chunk]')].map((node) => node.dataset.chunk)

describe('chunked preview', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        global.IS_REACT_ACT_ENVIRONMENT = true
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('renders only the first chunk at first', async () => {
        const { container } = await mount({ reader: buildReader(4), backlinksHtml: '' })

        expect(chunkIds(container())).toEqual(['0'])
    })

    test('appends the remaining chunks in order over time', async () => {
        const { container } = await mount({ reader: buildReader(4), backlinksHtml: '' })

        await act(async () => { jest.advanceTimersByTime(200) })

        expect(chunkIds(container())).toEqual(['0', '1', '2', '3'])
    })

    test('reports completion once after the last chunk', async () => {
        const onComplete = jest.fn()

        await mount({ reader: buildReader(3), backlinksHtml: '', onComplete })
        await act(async () => { jest.advanceTimersByTime(200) })

        expect(onComplete).toHaveBeenCalledTimes(1)
    })

    test('flushAll mounts every remaining chunk right away', async () => {
        const { container, flush } = await mount({ reader: buildReader(5), backlinksHtml: '' })

        await act(async () => { flush.current() })

        expect(chunkIds(container())).toEqual(['0', '1', '2', '3', '4'])
    })

    test('keeps a single chunk note whole and puts the backlinks inline', async () => {
        const { container } = await mount({ reader: buildReader(1), backlinksHtml: '<div class="backlinks">B</div>' })

        expect(chunkIds(container())).toEqual(['0'])
        expect(container().querySelectorAll('.backlinks')).toHaveLength(1)
    })

    test('appends the backlinks after the last chunk', async () => {
        const { container } = await mount({ reader: buildReader(3), backlinksHtml: '<div class="backlinks">B</div>' })

        expect(container().querySelectorAll('.backlinks')).toHaveLength(0)

        await act(async () => { jest.advanceTimersByTime(200) })

        expect(container().lastElementChild.className).toBe('backlinks')
    })

    test('replaces the backlinks when they change after completion', async () => {
        const host = document.createElement('div')
        const flush = { current: null }
        const root = createRoot(host)
        const reader = buildReader(3)

        await act(async () => { root.render(<Harness onFlush={flush} reader={reader} backlinksHtml='<div class="backlinks">A</div>' />) })
        await act(async () => { jest.advanceTimersByTime(200) })
        await act(async () => { root.render(<Harness onFlush={flush} reader={reader} backlinksHtml='<div class="backlinks">B</div>' />) })

        const nodes = host.firstElementChild.querySelectorAll('.backlinks')

        expect(nodes).toHaveLength(1)
        expect(nodes[0].textContent).toBe('B')
    })

    test('stops appending when the reader changes', async () => {
        const host = document.createElement('div')
        const flush = { current: null }
        const root = createRoot(host)
        const first = buildReader(5)
        const second = buildReader(1)

        await act(async () => { root.render(<Harness onFlush={flush} reader={first} backlinksHtml='' />) })
        await act(async () => { root.render(<Harness onFlush={flush} reader={second} backlinksHtml='' />) })
        await act(async () => { jest.advanceTimersByTime(200) })

        expect(first.render).toHaveBeenCalledTimes(1)
    })
})
