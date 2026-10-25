import { useContext } from 'react'

import { GroupPositionContext } from '@/context/group-position-context'
import { GROUP_POSITIONS } from '@/constants/group-position'

export function useGroupPosition() {
    const inherited = useContext(GroupPositionContext)

    return inherited ?? GROUP_POSITIONS.ONLY
}
