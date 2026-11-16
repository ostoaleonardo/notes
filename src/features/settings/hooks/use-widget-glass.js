import { useContext } from 'react'

import { WidgetsContext } from '@/shared/context/widgets-context'

export function useWidgetGlass() {
    return useContext(WidgetsContext)
}
