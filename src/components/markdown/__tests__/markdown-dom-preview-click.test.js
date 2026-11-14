import { resolvePreviewClick } from '../markdown-dom-preview-click'

import { CODE_COPY_SELECTOR } from '@/constants/code-copy'

const createTarget = ({ link, image, copyButton, isCheckbox = false, embedded = false } = {}) => ({
    closest: (selector) => {
        if (selector === CODE_COPY_SELECTOR) return copyButton || null
        if (selector === 'a') return link || null
        if (selector === 'img') return image || null
        return embedded ? {} : null
    },
    matches: () => isCheckbox
})

const createContainer = (checkboxes) => ({
    querySelectorAll: () => checkboxes
})

describe('resolve preview click', () => {
    test('returns the href when a link was clicked', () => {
        const target = createTarget({ link: { getAttribute: () => 'https://expo.dev' } })

        expect(resolvePreviewClick(target, createContainer([]))).toEqual({
            type: 'link',
            url: 'https://expo.dev'
        })
    })

    test('returns the src when an image was clicked', () => {
        const target = createTarget({ image: { getAttribute: () => 'file:///a.png' } })

        expect(resolvePreviewClick(target, createContainer([]))).toEqual({
            type: 'image',
            url: 'file:///a.png'
        })
    })

    test('ignores clicks on anything else', () => {
        expect(resolvePreviewClick(createTarget(), createContainer([]))).toBeNull()
    })

    test('returns the checkbox index among the non-embedded checkboxes', () => {
        const embeddedCheckbox = { closest: () => ({}) }
        const target = { ...createTarget({ isCheckbox: true }) }
        const plainCheckbox = { closest: () => null }
        const container = createContainer([embeddedCheckbox, plainCheckbox, target])

        expect(resolvePreviewClick(target, container)).toEqual({ type: 'task', index: 1 })
    })

    test('blocks a checkbox that lives inside an embed', () => {
        const target = createTarget({ isCheckbox: true, embedded: true })

        expect(resolvePreviewClick(target, createContainer([target]))).toEqual({
            type: 'blocked-task'
        })
    })

    test('resolves a code copy click with the block text', () => {
        const code = { textContent: 'const a = 1' }
        const block = { querySelector: () => code }
        const copyButton = { closest: () => block }
        const target = createTarget({ copyButton })

        expect(resolvePreviewClick(target, createContainer([]))).toEqual({
            type: 'copy-code',
            button: copyButton,
            text: 'const a = 1'
        })
    })
})
