import { createContext } from 'react'

export const DEFAULT_THEME = { colors: {}, dark: false }

export const ThemeContext = createContext(DEFAULT_THEME)
