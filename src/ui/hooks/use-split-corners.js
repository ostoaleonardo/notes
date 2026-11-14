import { useGroupPosition } from './use-group-position'
import { getSegmentCorners } from '@/ui/utils/group-position'

import { SPLIT_TRIGGER_RADIUS } from '@/ui/tokens/components'

export const useSplitCorners = () => getSegmentCorners(
    useGroupPosition(),
    SPLIT_TRIGGER_RADIUS.outer,
    SPLIT_TRIGGER_RADIUS.inner
)
