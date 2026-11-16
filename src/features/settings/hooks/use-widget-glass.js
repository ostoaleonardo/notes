import { useContext } from 'react'

import { WidgetsContext } from '@/context/widgets-context'

export function useWidgetGlass() {
    return useContext(WidgetsContext)
}
