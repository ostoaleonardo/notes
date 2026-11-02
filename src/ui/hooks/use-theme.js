import { useContext } from 'react'

import { ThemeContext } from '@/ui/context/theme-context'

export const useTheme = () => useContext(ThemeContext)
