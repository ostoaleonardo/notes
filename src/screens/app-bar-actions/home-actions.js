import { SortAction } from './sort-action'
import { ViewAction } from './view-action'

export function HomeAction() {
    return (
        <>
            <ViewAction />
            <SortAction />
        </>
    )
}
