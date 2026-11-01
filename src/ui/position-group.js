import { Children } from 'react'

import { GroupPositionContext } from '@/ui/context/group-position-context'
import { getGroupPosition } from '@/ui/utils/group-position'

export function PositionGroup({ children }) {
    const items = Children.toArray(children)

    return items.map((child, index) => (
        <GroupPositionContext.Provider
            key={child.key}
            value={getGroupPosition(index, items.length)}
        >
            {child}
        </GroupPositionContext.Provider>
    ))
}
