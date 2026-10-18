import { buildTreeIndex, getSatellites, layoutFocusRing, paginate } from '../focus-navigation'
import { ROOT_ENTITY, buildConnectionModel, makeEntity } from '../connection-model'
import { buildPathTree } from '../connection-tree'
import {
    MOCK_CONNECTION_FILES,
    MOCK_CONNECTION_NOTES,
    MOCK_CONNECTION_NOTE_PATHS
} from '../__fixtures__/connections'
import { CONNECTION_TYPES, RELATION_BADGES } from '@/constants/connections'

const { NOTE, FOLDER, TAG, FILE, MISSING } = CONNECTION_TYPES

const model = buildConnectionModel({
    notes: MOCK_CONNECTION_NOTES,
    notePaths: MOCK_CONNECTION_NOTE_PATHS,
    files: MOCK_CONNECTION_FILES,
    rootName: 'Vault'
})

const index = buildTreeIndex(buildPathTree(model))

const ids = (satellites) => satellites.map((item) => item.entity.id)

describe('get satellites', () => {
    test('lists folders first and then notes around the repository', () => {
        expect(ids(getSatellites(ROOT_ENTITY, model, index))).toEqual([
            'attachments',
            'Projects',
            'r::Alpha.md',
            'r::Index.md',
            'r::Lonely.md'
        ])
    })

    test('lists the contents of a folder', () => {
        const folder = makeEntity(FOLDER, 'Projects')

        expect(ids(getSatellites(folder, model, index))).toEqual([
            'Projects/Deep',
            'p::Beta.md',
            'file:spec'
        ])
    })

    test('lists the notes linked with a note and the direction of each link', () => {
        const satellites = getSatellites(makeEntity(NOTE, 'r::Index.md'), model, index)

        expect(satellites).toEqual([
            { entity: makeEntity(NOTE, 'r::Alpha.md'), relation: RELATION_BADGES.BOTH },
            { entity: makeEntity(MISSING, 'missing:ghost'), relation: RELATION_BADGES.OUT }
        ])
    })

    test('marks links that only leave or only arrive at the note', () => {
        expect(getSatellites(makeEntity(NOTE, 'd::Gamma.md'), model, index)).toEqual([
            { entity: makeEntity(NOTE, 'r::Alpha.md'), relation: RELATION_BADGES.OUT }
        ])
        expect(
            getSatellites(makeEntity(NOTE, 'r::Alpha.md'), model, index)
                .find((item) => item.entity.id === 'd::Gamma.md').relation
        ).toBe(RELATION_BADGES.IN)
    })

    test('lists the notes of a tag, a file and an unresolved target', () => {
        expect(ids(getSatellites(makeEntity(TAG, 'ideas'), model, index))).toEqual([
            'd::Gamma.md',
            'r::Index.md'
        ])
        expect(ids(getSatellites(makeEntity(FILE, 'file:photo'), model, index)))
            .toEqual(['r::Index.md'])
        expect(ids(getSatellites(makeEntity(MISSING, 'missing:ghost'), model, index))).toEqual([
            'r::Index.md'
        ])
    })

    test('returns nothing for a note without links', () => {
        expect(getSatellites(makeEntity(NOTE, 'r::Lonely.md'), model, index)).toEqual([])
    })
})

describe('paginate', () => {
    const items = Array.from({ length: 18 }, (_, index) => index)

    test('splits the items into pages of the requested size', () => {
        expect(paginate(items, 0, 7)).toEqual({ items: [0, 1, 2, 3, 4, 5, 6], page: 0, pages: 3 })
        expect(paginate(items, 2, 7)).toEqual({ items: [14, 15, 16, 17], page: 2, pages: 3 })
    })

    test('keeps the page inside the available range', () => {
        expect(paginate(items, 9, 7).page).toBe(2)
        expect(paginate(items, -3, 7).page).toBe(0)
    })

    test('reports a single page for an empty list', () => {
        expect(paginate([], 0, 7)).toEqual({ items: [], page: 0, pages: 1 })
    })
})

describe('layout focus ring', () => {
    const options = {
        width: 400,
        height: 700,
        nodeWidth: 128,
        nodeHeight: 36,
        reserve: 80,
        margin: 16,
        maxAspect: 10
    }

    test('centers the focus above the reserved space', () => {
        const { center } = layoutFocusRing({ ...options, count: 3 })

        expect(center).toEqual({ x: 200, y: 310 })
    })

    test('places the first satellite at the top and keeps all of them inside the stage', () => {
        const { positions, center } = layoutFocusRing({ ...options, count: 6 })

        expect(positions).toHaveLength(6)
        expect(positions[0].x).toBeCloseTo(center.x)
        expect(positions[0].y).toBeLessThan(center.y)

        positions.forEach((position) => {
            expect(position.x - 64).toBeGreaterThanOrEqual(0)
            expect(position.x + 64).toBeLessThanOrEqual(options.width)
            expect(position.y - 18).toBeGreaterThanOrEqual(0)
            expect(position.y + 18).toBeLessThanOrEqual(options.height - options.reserve)
        })
    })

    test.each([1, 2, 3, 4, 5, 6])('never overlaps satellites with %i per page', (count) => {
        const { positions } = layoutFocusRing({ ...options, count })

        positions.forEach((a, i) => positions.slice(i + 1).forEach((b) => {
            const overlapX = Math.abs(a.x - b.x) < options.nodeWidth
            const overlapY = Math.abs(a.y - b.y) < options.nodeHeight

            expect(overlapX && overlapY).toBe(false)
        }))
    })

    test('limits the vertical stretch of the ring to the maximum aspect', () => {
        const { positions, center } = layoutFocusRing({ ...options, count: 6, maxAspect: 1.5 })

        expect(center.y - positions[0].y).toBeCloseTo(120 * 1.5)
    })

    test('returns no positions without satellites', () => {
        expect(layoutFocusRing({ ...options, count: 0 }).positions).toEqual([])
    })
})
