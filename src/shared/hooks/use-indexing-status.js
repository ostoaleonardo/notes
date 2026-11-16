import { useSyncExternalStore } from 'react'

import { getIndexingStatus, subscribeIndexingStatus } from '@/shared/utils/indexing-status'

const selectStatus = (status) => status

export function useIndexingStatus(select = selectStatus) {
    return useSyncExternalStore(subscribeIndexingStatus, () => select(getIndexingStatus()))
}
