import { useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'
import { useTags } from '../use-tags'
import { NoteContext } from '@/context/note-context'
import { DEFAULT_TAGS } from '@/constants'
import { MOCK_ROOT_URI } from '../__fixtures__/constants'
import { MOCK_PERSONAL_TAG, MOCK_WORK_TAG } from '../__fixtures__/tags'

const mockFileStorage = { writeJson: jest.fn() }

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
                    paramId: '',
                    setParamId: () => { },
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
})

describe('add tag', () => {
    test('appends a new tag and persists the full list', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(() => {
            result.current.addTag(MOCK_PERSONAL_TAG)
        })

        expect(result.current.tags.map((tag) => tag.name)).toEqual(['work', 'personal'])
        expect(mockFileStorage.writeJson).toHaveBeenCalledWith(
            MOCK_ROOT_URI,
            '.tags.json',
            result.current.tags
        )
    })

    test('does not duplicate a tag that already exists', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(() => {
            result.current.addTag(MOCK_WORK_TAG)
        })

        expect(result.current.tags).toHaveLength(1)
    })
})

describe('update tag', () => {
    test('renames a tag by id', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        await act(() => {
            result.current.updateTag({ id: 'tag-1', name: 'career' })
        })

        expect(result.current.tags[0].name).toBe('career')
    })
})

describe('delete tag', () => {
    test('removes a tag by id and persists the change', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG, MOCK_PERSONAL_TAG])

        await act(() => {
            result.current.deleteTag('tag-1')
        })

        expect(result.current.tags.map((tag) => tag.id)).toEqual(['tag-2'])
        expect(mockFileStorage.writeJson).toHaveBeenCalledWith(
            MOCK_ROOT_URI,
            '.tags.json',
            [MOCK_PERSONAL_TAG]
        )
    })
})

describe('get tag', () => {
    test('returns the matching tag', async () => {
        const { result } = await renderTagsHook([MOCK_WORK_TAG])

        expect(result.current.getTag('tag-1')).toBe(MOCK_WORK_TAG)
    })

    test('returns an empty object when no tag matches', async () => {
        const { result } = await renderTagsHook([])

        expect(result.current.getTag('missing')).toEqual({})
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
