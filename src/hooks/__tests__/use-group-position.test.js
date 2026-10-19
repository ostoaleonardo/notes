import { render } from '@testing-library/react-native'

import { PositionGroup } from '@/components/position-group'
import { useGroupPosition } from '../use-group-position'

const collect = (positions, name) => {
    const Probe = () => {
        positions[name] = useGroupPosition()

        return null
    }

    return <Probe key={name} />
}

describe('group position of an item', () => {
    test('is only outside of a group', async () => {
        const positions = {}

        await render(collect(positions, 'a'))

        expect(positions).toEqual({ a: 'only' })
    })

    test('follows the order of the children', async () => {
        const positions = {}

        await render(
            <PositionGroup>
                {collect(positions, 'a')}
                {collect(positions, 'b')}
                {collect(positions, 'c')}
            </PositionGroup>
        )

        expect(positions).toEqual({ a: 'first', b: 'middle', c: 'last' })
    })

    test('ignores children that are not rendered', async () => {
        const positions = {}
        const hidden = false

        await render(
            <PositionGroup>
                {collect(positions, 'a')}
                {hidden && collect(positions, 'b')}
                {null}
            </PositionGroup>
        )

        expect(positions).toEqual({ a: 'only' })
    })

    test('flattens arrays of children', async () => {
        const positions = {}

        await render(
            <PositionGroup>
                {['a', 'b'].map((name) => collect(positions, name))}
                {collect(positions, 'c')}
            </PositionGroup>
        )

        expect(positions).toEqual({ a: 'first', b: 'middle', c: 'last' })
    })
})
