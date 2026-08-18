import { ImportAction } from './import-action'
import { SortAction } from './sort-action'
import { ViewAction } from './view-action'

export function HomeAction() {
    return (
        <>
            <ImportAction />
            <ViewAction />
            <SortAction />
        </>
    )
}
