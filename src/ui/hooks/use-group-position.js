import { useContext } from 'react'

import { GroupPositionContext } from '@/ui/context/group-position-context'
import { GROUP_POSITIONS } from '@/ui/tokens/group-position'

export function useGroupPosition() {
    const inherited = useContext(GroupPositionContext)

    return inherited ?? GROUP_POSITIONS.ONLY
}
