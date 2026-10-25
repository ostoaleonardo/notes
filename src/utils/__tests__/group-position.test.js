import {
    GROUP_AXES,
    getCornerRadii,
    getGroupPosition,
    getGroupedRadius,
    getSegmentCorners,
    getStackedCorners
} from '../group-position'
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

describe('corner radii by axis', () => {
    test('stacked uses the medium radius between items', () => {
        expect(getCornerRadii('middle', GROUP_AXES.STACKED)).toEqual({
            topLeft: RADIUS.md,
            topRight: RADIUS.md,
            bottomLeft: RADIUS.md,
            bottomRight: RADIUS.md
        })
    })

    test('segmented rounds the outer side of the first button', () => {
        const radii = getCornerRadii('first', GROUP_AXES.SEGMENTED)

        expect(radii.topLeft).toBe(RADIUS.xl)
        expect(radii.topRight).toBe(RADIUS.sm)
    })
})

describe('card corner radii', () => {
    test('keeps square corners between cards', () => {
        expect(getCornerRadii('middle', GROUP_AXES.CARD)).toEqual({
            topLeft: 0,
            topRight: 0,
            bottomLeft: 0,
            bottomRight: 0
        })
    })

    test('rounds only the outer edges of the first card', () => {
        const radii = getCornerRadii('first', GROUP_AXES.CARD)

        expect(radii.topLeft).toBe(RADIUS.lg)
        expect(radii.bottomLeft).toBe(0)
    })
})
