import { SortAction } from './sort-action'
import { SyncAction } from './sync-action'
import { ViewAction } from './view-action'

export function HomeAction() {
    return (
        <>
            <SyncAction />
            <ViewAction />
            <SortAction />
        </>
    )
}
