import { useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { useTags } from '../use-tags'
import { MOCK_ROOT_URI } from '../__fixtures__/constants'
import { MOCK_PERSONAL_TAG, MOCK_WORK_TAG } from '../__fixtures__/tags'
import { NoteContext } from '@/context/note-context'

import { DEFAULT_TAGS } from '@/constants/default-values'

const mockFileStorage = { writeJson: jest.fn() }
const mockUpdateNote = jest.fn(async () => {})
let mockNotes = []

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: jest.fn(async () => null) })
}))
jest.mock('../use-repository-data', () => ({
    useRepositoryData: () => async () => ({ notes: [], tags: [] })
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({ activeRepositoryTree: [{ uri: MOCK_ROOT_URI }] })
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({ notes: mockNotes, updateNote: mockUpdateNote })
}))

const renderTagsHook = (initialTags = []) => {
    const Wrapper = ({ children }) => {
        const [notes, setNotes] = useState([])
        const [tags, setTags] = useState(initialTags)

        return (
            <NoteContext.Provider
                value={{
                    notes,
                    setNotes,
                    tags,
                    setTags,
                    loading: false,
                    clear: () => { }
                }}
            >
                {children}
            </NoteContext.Provider>
        )
    }

    return renderHook(() => useTags(), { wrapper: Wrapper })
}

beforeEach(() => {
    jest.clearAllMocks()
    mockNotes = []
})

describe('add tag', () => {
    test('appends a new tag and persists the full list', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(() => {
            result.current.addTag(MOCK_PERSONAL_TAG)
        })

        expect(result.current.tags).toEqual(['work', 'personal'])
        expect(mockFileStorage.writeJson).toHaveBeenCalledWith(
            MOCK_ROOT_URI,
            '.tags.json',
            result.current.tags
        )
    })

    test('does not duplicate a tag with the same name', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        let addResult
        await act(() => {
            addResult = result.current.addTag(MOCK_WORK_TAG)
        })

        expect(addResult).toBe('duplicate')
        expect(result.current.tags).toHaveLength(1)
    })
})

describe('update tag', () => {
    test('renames a tag', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(async () => {
            await result.current.updateTag(MOCK_WORK_TAG, 'career')
        })

        expect(result.current.tags[0]).toBe('career')
    })

    test('rejects the rename when the new name is already taken by another tag', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])

        let updateResult
        await act(async () => {
            updateResult = await result.current.updateTag(MOCK_WORK_TAG, MOCK_PERSONAL_TAG)
        })

        expect(updateResult).toBe('duplicate')
        expect(result.current.tags).toEqual([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])
    })

    test('renames the tag in every note that has it', async () => {
        mockNotes = [
            { path: 'repo-1::a.md', tags: [MOCK_WORK_TAG] },
            { path: 'repo-1::b.md', tags: [MOCK_PERSONAL_TAG] }
        ]
        const { result } = await renderTagsHook([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])

        await act(async () => {
            await result.current.updateTag(MOCK_WORK_TAG, 'career')
        })

        expect(mockUpdateNote).toHaveBeenCalledTimes(1)
        expect(mockUpdateNote).toHaveBeenCalledWith(
            expect.objectContaining({ path: 'repo-1::a.md', tags: ['career'] })
        )
    })
})

describe('delete tag', () => {
    test('removes a tag and persists the change', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])

        await act(async () => {
            await result.current.deleteTag(MOCK_WORK_TAG)
        })

        expect(result.current.tags).toEqual([MOCK_PERSONAL_TAG])
        expect(mockFileStorage.writeJson).toHaveBeenCalledWith(
            MOCK_ROOT_URI,
            '.tags.json',
            [MOCK_PERSONAL_TAG]
        )
    })

    test('strips the tag from every note that has it', async () => {
        mockNotes = [
            { path: 'repo-1::a.md', tags: [MOCK_WORK_TAG, MOCK_PERSONAL_TAG] },
            { path: 'repo-1::b.md', tags: [MOCK_PERSONAL_TAG] }
        ]
        const { result } = await renderTagsHook([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])

        await act(async () => {
            await result.current.deleteTag(MOCK_WORK_TAG)
        })

        expect(mockUpdateNote).toHaveBeenCalledTimes(1)
        expect(mockUpdateNote).toHaveBeenCalledWith(
            expect.objectContaining({ path: 'repo-1::a.md', tags: [MOCK_PERSONAL_TAG] })
        )
    })
})

describe('delete all tags', () => {
    test('resets tags to the default list', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(async () => {
            await result.current.deleteAllTags()
        })

        expect(result.current.tags).toEqual(DEFAULT_TAGS)
    })
})
