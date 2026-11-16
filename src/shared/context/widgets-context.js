import { createContext } from 'react'

import { WIDGET_GLASS_ALPHA } from '@/shared/constants/widgets'

export const WidgetsContext = createContext({
    glass: false,
    setGlass: () => {},
    alpha: WIDGET_GLASS_ALPHA.default,
    setAlpha: () => {}
})
