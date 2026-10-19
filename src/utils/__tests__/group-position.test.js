import { getGroupPosition, getSegmentCorners, getStackedCorners } from '../group-position'
import { getGroupedRadius } from '../grouped-card-style'
import { RADIUS } from '@/constants/theme'

describe('position of an item in a group', () => {
    test('is only when the group has a single item', () => {
        expect(getGroupPosition(0, 1)).toBe('only')
    })

    test('is only for an empty group', () => {
        expect(getGroupPosition(0, 0)).toBe('only')
    })

    test('marks the first, middle and last items', () => {
        expect([0, 1, 2, 3].map((index) => getGroupPosition(index, 4)))
            .toEqual(['first', 'middle', 'middle', 'last'])
    })

    test('marks both ends of a pair', () => {
        expect([0, 1].map((index) => getGroupPosition(index, 2)))
            .toEqual(['first', 'last'])
    })
})

describe('stacked corners of a grouped item', () => {
    test('rounds only the outer edge of the first and last items', () => {
        expect(getStackedCorners('first')).toEqual({ top: RADIUS.lg, bottom: 0 })
        expect(getStackedCorners('last')).toEqual({ top: 0, bottom: RADIUS.lg })
    })

    test('rounds both edges of a lone item', () => {
        expect(getStackedCorners('only')).toEqual({ top: RADIUS.lg, bottom: RADIUS.lg })
    })

    test('uses the inner radius between items', () => {
        expect(getStackedCorners('middle', RADIUS.md)).toEqual({ top: RADIUS.md, bottom: RADIUS.md })
    })

    test('applies the corners to every side of the card', () => {
        expect(getGroupedRadius('first')).toEqual({
            borderTopLeftRadius: RADIUS.lg,
            borderTopRightRadius: RADIUS.lg,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
        })
    })
})

describe('segment corners of a grouped button', () => {
    test('rounds only the outer side of the first and last buttons', () => {
        expect(getSegmentCorners('first', 20, 4)).toEqual({ left: 20, right: 4 })
        expect(getSegmentCorners('last', 20, 4)).toEqual({ left: 4, right: 20 })
    })

    test('uses the inner radius on both sides of a middle button', () => {
        expect(getSegmentCorners('middle', 20, 4)).toEqual({ left: 4, right: 4 })
    })

    test('rounds both sides of a lone button', () => {
        expect(getSegmentCorners('only', 20, 4)).toEqual({ left: 20, right: 20 })
    })
})
