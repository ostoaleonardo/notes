import { getBundledTemplates, getBundledWelcome, loadBundledContent } from '../bundled-content'

const mockFiles = {
    './welcome/en.md': 'welcome en',
    './welcome/es.md': 'welcome es',
    './templates/en/journal.md': 'journal en',
    './templates/en/goals.md': 'goals en',
    './templates/es/journal.md': 'journal es'
}

jest.mock('@/constants/bundled-context', () => ({
    bundledContent: Object.assign((key) => key, { keys: () => Object.keys(mockFiles) })
}))

jest.mock('../bundled-asset', () => ({
    parseBundledKey: jest.requireActual('../bundled-asset').parseBundledKey,
    readBundledText: async (key) => mockFiles[key]
}))

describe('load bundled content', () => {
    test('groups the welcome note by language', async () => {
        await loadBundledContent()

        expect(getBundledWelcome()).toBe('welcome en')
    })

    test('groups the templates by language and name', async () => {
        await loadBundledContent()

        expect(getBundledTemplates()).toEqual({ journal: 'journal en', goals: 'goals en' })
    })
})
