import { act, renderHook } from '@testing-library/react-native'

import { useTemplates } from '../use-templates'
import { MOCK_REPO_URI, MOCK_TEMPLATES_URI } from '../__fixtures__/constants'
import { subscribeTemplatesChanged } from '@/utils/templates-events'

const mockFileStorage = {
    findFile: jest.fn(),
    findDirectory: jest.fn(),
    listMarkdownFiles: jest.fn(),
    listSubdirectories: jest.fn(() => []),
    createSubdirectory: jest.fn(),
    writeNoteFile: jest.fn(),
    renameNoteFile: jest.fn(async () => { }),
    deleteNoteFile: jest.fn()
}

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: { id: 'repo-1', uri: MOCK_REPO_URI },
        ensureTemplatesFolder: async () => MOCK_TEMPLATES_URI
    })
}))

let files

const renderTemplatesHook = () => renderHook(() => useTemplates())

beforeEach(() => {
    files = new Map()

    jest.clearAllMocks()
    mockFileStorage.findFile.mockImplementation((_uri, filename) => (
        files.has(filename) ? { text: async () => files.get(filename) } : undefined
    ))
    mockFileStorage.listMarkdownFiles.mockImplementation(() => (
        Array.from(files.entries()).map(([name, content]) => ({ name, text: async () => content }))
    ))
    mockFileStorage.writeNoteFile.mockImplementation((_uri, filename, content) => {
        files.set(filename, content)
    })
    mockFileStorage.deleteNoteFile.mockImplementation((_uri, filename) => {
        files.delete(filename)
    })
    mockFileStorage.renameNoteFile.mockImplementation(async (_uri, oldName, newName) => {
        files.set(newName, files.get(oldName))
        files.delete(oldName)
    })
})

describe('add template', () => {
    test('writes a new template file and returns its filename', async () => {
        const { result } = await renderTemplatesHook()

        const filename = await act(async () =>
            result.current.addTemplate('Meeting notes', '# {{title}}')
        )

        expect(filename).toBe('Meeting notes.md')
        expect(files.get('Meeting notes.md')).toBe('# {{title}}')
    })

    test('disambiguates the filename when the name is already taken', async () => {
        files.set('Meeting notes.md', 'existing')
        const { result } = await renderTemplatesHook()

        const filename = await act(async () => result.current.addTemplate('Meeting notes'))

        expect(filename).toBe('Meeting notes (2).md')
    })
})

describe('list templates', () => {
    test('lists every template with its content', async () => {
        files.set('A.md', 'content a')
        files.set('B.md', 'content b')
        const { result } = await renderTemplatesHook()

        const templates = await act(async () => result.current.listTemplates())

        expect(templates.map((template) => template.name).sort()).toEqual(['A', 'B'])
        expect(templates.find((template) => template.name === 'A').content).toBe('content a')
    })
})

describe('list templates without content', () => {
    test('does not read the file contents', async () => {
        const text = jest.fn(async () => 'content a')
        mockFileStorage.listMarkdownFiles.mockImplementation(() => [{ name: 'A.md', text }])
        const { result } = await renderTemplatesHook()

        const templates = await act(async () =>
            result.current.listTemplates({ withContent: false })
        )

        expect(templates).toEqual([{
            filename: 'A.md',
            name: 'A',
            folder: '',
            content: ''
        }])
        expect(text).not.toHaveBeenCalled()
    })
})

describe('get template', () => {
    test('returns the template content by filename', async () => {
        files.set('A.md', 'content a')
        const { result } = await renderTemplatesHook()

        const template = await act(async () => result.current.getTemplate('A.md'))

        expect(template).toEqual({ filename: 'A.md', name: 'A', content: 'content a' })
    })

    test('returns null when the template does not exist', async () => {
        const { result } = await renderTemplatesHook()

        const template = await act(async () => result.current.getTemplate('missing.md'))

        expect(template).toBeNull()
    })
})

describe('update template', () => {
    test('rewrites the content without renaming when the name is unchanged', async () => {
        files.set('A.md', 'old')
        const { result } = await renderTemplatesHook()

        const filename = await act(async () => result.current.updateTemplate('A.md', 'A', 'new'))

        expect(filename).toBe('A.md')
        expect(files.get('A.md')).toBe('new')
        expect(mockFileStorage.renameNoteFile).not.toHaveBeenCalled()
    })

    test('renames the file when the name changes', async () => {
        files.set('A.md', 'content')
        const { result } = await renderTemplatesHook()

        const filename = await act(async () =>
            result.current.updateTemplate('A.md', 'B', 'content')
        )

        expect(filename).toBe('B.md')
        expect(files.has('A.md')).toBe(false)
        expect(files.get('B.md')).toBe('content')
    })
})

describe('update template that was deleted', () => {
    test('does not recreate the file', async () => {
        const { result } = await renderTemplatesHook()

        const filename = await act(async () => result.current.updateTemplate('A.md', 'A', 'new'))

        expect(filename).toBe('A.md')
        expect(files.size).toBe(0)
        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })
})

describe('delete template', () => {
    test('removes the template file', async () => {
        files.set('A.md', 'content')
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.deleteTemplate('A.md'))

        expect(files.has('A.md')).toBe(false)
    })
})

describe('templates changed notification', () => {
    let listener
    let unsubscribe

    beforeEach(() => {
        listener = jest.fn()
        unsubscribe = subscribeTemplatesChanged(listener)
    })

    afterEach(() => unsubscribe())

    test('notifies after adding a template', async () => {
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.addTemplate('A', 'content'))

        expect(listener).toHaveBeenCalledTimes(1)
    })

    test('notifies after updating a template', async () => {
        files.set('A.md', 'old')
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.updateTemplate('A.md', 'A', 'new'))

        expect(listener).toHaveBeenCalledTimes(1)
    })

    test('does not notify when updating a deleted template', async () => {
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.updateTemplate('A.md', 'A', 'new'))

        expect(listener).not.toHaveBeenCalled()
    })

    test('notifies after deleting a template', async () => {
        files.set('A.md', 'content')
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.deleteTemplate('A.md'))

        expect(listener).toHaveBeenCalledTimes(1)
    })

    test('notifies after adding a template folder', async () => {
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.addTemplateFolder('Work'))

        expect(listener).toHaveBeenCalledTimes(1)
    })

    test('stops notifying after unsubscribing', async () => {
        unsubscribe()
        files.set('A.md', 'content')
        const { result } = await renderTemplatesHook()

        await act(async () => result.current.deleteTemplate('A.md'))

        expect(listener).not.toHaveBeenCalled()
    })
})
