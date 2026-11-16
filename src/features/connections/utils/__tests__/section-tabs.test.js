import { findSectionById, resolveSection, sectionId } from '../section-tabs'
import { CONNECTION_SECTIONS } from '@/constants/connections'

const relations = [
    { key: CONNECTION_SECTIONS.LINKS_OUT, entities: [] },
    { key: CONNECTION_SECTIONS.TAGS, entities: [] }
]

describe('resolve the selected section', () => {
    test('uses the section chosen for the same entity', () => {
        const selection = { id: 'note:a', key: CONNECTION_SECTIONS.TAGS }

        expect(resolveSection(relations, selection, 'note:a')).toBe(relations[1])
    })

    test('falls back to the first section when the choice belongs to another entity', () => {
        const selection = { id: 'note:a', key: CONNECTION_SECTIONS.TAGS }

        expect(resolveSection(relations, selection, 'note:b')).toBe(relations[0])
    })

    test('falls back to the first section when the chosen one no longer exists', () => {
        const selection = { id: 'note:a', key: CONNECTION_SECTIONS.FILES }

        expect(resolveSection(relations, selection, 'note:a')).toBe(relations[0])
    })

    test('returns nothing when there are no sections', () => {
        expect(resolveSection([], { id: null, key: null }, 'note:a')).toBeNull()
    })
})

describe('find a section by its id', () => {
    test('matches the entity and section key together', () => {
        const id = sectionId('note:a', CONNECTION_SECTIONS.TAGS)

        expect(findSectionById(relations, 'note:a', id)).toBe(relations[1])
    })

    test('returns nothing for an id from another entity', () => {
        const id = sectionId('note:a', CONNECTION_SECTIONS.TAGS)

        expect(findSectionById(relations, 'note:b', id)).toBeNull()
    })
})
